package com.pitcc.integration.r2;

import java.net.URI;
import java.time.Duration;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

public class R2AvatarStorage implements AvatarStorage, DisposableBean {
  private static final Logger log = LoggerFactory.getLogger(R2AvatarStorage.class);
  private static final Duration UPLOAD_TTL = Duration.ofMinutes(5);
  private static final Duration READ_TTL = Duration.ofHours(12);

  private final S3Client s3;
  private final S3Presigner presigner;
  private final String bucket;

  public R2AvatarStorage(R2Properties properties) {
    var credentials = StaticCredentialsProvider.create(
        AwsBasicCredentials.create(properties.accessKeyId(), properties.secretAccessKey()));
    var configuration = S3Configuration.builder()
        .pathStyleAccessEnabled(true)
        .checksumValidationEnabled(false)
        .build();
    var endpoint = URI.create(properties.endpoint());
    this.s3 = S3Client.builder()
        .endpointOverride(endpoint)
        .region(Region.of("auto"))
        .credentialsProvider(credentials)
        .serviceConfiguration(configuration)
        .build();
    this.presigner = S3Presigner.builder()
        .endpointOverride(endpoint)
        .region(Region.of("auto"))
        .credentialsProvider(credentials)
        .serviceConfiguration(configuration)
        .build();
    this.bucket = properties.bucket();
  }

  @Override
  public Ticket prepare(String userId, String contentType, long contentLength) {
    AvatarImages.checkSize(contentLength);
    String extension = AvatarImages.extension(contentType);
    String key = "avatars/" + userId + "/" + UUID.randomUUID() + "." + extension;
    var put = PutObjectRequest.builder()
        .bucket(bucket)
        .key(key)
        .contentType(contentType)
        .build();
    try {
      String uploadUrl = presigner.presignPutObject(request -> request
          .signatureDuration(UPLOAD_TTL)
          .putObjectRequest(put)).url().toString();
      return new Ticket(uploadUrl, key);
    } catch (SdkException exception) {
      log.warn("Falha ao preparar upload do avatar: {}", exception.getMessage());
      throw new IllegalArgumentException("Não foi possível preparar o envio da foto. Tente novamente.");
    }
  }

  @Override
  public void verify(String userId, String key) {
    requireOwned(userId, key);
    HeadObjectResponse head;
    byte[] header;
    try {
      head = s3.headObject(request -> request.bucket(bucket).key(key));
      header = s3.getObjectAsBytes(GetObjectRequest.builder()
          .bucket(bucket).key(key).range("bytes=0-15").build()).asByteArray();
    } catch (NoSuchKeyException exception) {
      throw new IllegalArgumentException("Não foi possível confirmar a foto. Envie novamente.");
    } catch (S3Exception exception) {
      if (exception.statusCode() == 404) {
        throw new IllegalArgumentException("Não foi possível confirmar a foto. Envie novamente.");
      }
      log.warn("Falha ao ler avatar {}: {}", key, exception.getMessage());
      throw new IllegalArgumentException("Não foi possível confirmar a foto. Tente novamente.");
    }
    long size = head.contentLength() == null ? 0 : head.contentLength();
    String contentType = head.contentType() == null ? "" : head.contentType().split(";", 2)[0].trim();
    try {
      AvatarImages.checkSize(size);
      AvatarImages.checkHeader(contentType, header);
    } catch (IllegalArgumentException exception) {
      delete(key);
      throw exception;
    }
  }

  @Override
  public void delete(String key) {
    if (key == null || key.isBlank()) return;
    try {
      s3.deleteObject(request -> request.bucket(bucket).key(key));
    } catch (NoSuchKeyException exception) {
      // O arquivo já não existe.
    } catch (S3Exception exception) {
      if (exception.statusCode() != 404) {
        log.warn("Falha ao apagar avatar {}: {}", key, exception.getMessage());
      }
    }
  }

  @Override
  public String readUrl(String key) {
    try {
      return presigner.presignGetObject(request -> request
          .signatureDuration(READ_TTL)
          .getObjectRequest(get -> get.bucket(bucket).key(key))).url().toString();
    } catch (SdkException exception) {
      log.warn("Falha ao gerar URL do avatar: {}", exception.getMessage());
      return null;
    }
  }

  public static void requireOwned(String userId, String key) {
    String prefix = "avatars/" + userId + "/";
    int slash = key == null ? -1 : key.indexOf('/', prefix.length());
    if (userId == null || userId.isBlank() || userId.indexOf('/') >= 0
        || key == null || !key.startsWith(prefix) || slash >= 0 || key.length() == prefix.length()) {
      throw new IllegalArgumentException("A foto enviada não pertence a esta conta.");
    }
  }

  @Override
  public void destroy() {
    s3.close();
    presigner.close();
  }
}
