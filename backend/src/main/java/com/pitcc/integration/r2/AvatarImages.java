package com.pitcc.integration.r2;

import java.util.Arrays;

final class AvatarImages {
  static final long MAX_BYTES = 2L * 1024 * 1024;

  private AvatarImages() {}

  static String extension(String contentType) {
    return switch (contentType == null ? "" : contentType) {
      case "image/jpeg" -> "jpg";
      case "image/png" -> "png";
      case "image/webp" -> "webp";
      default -> throw new IllegalArgumentException("Envie uma imagem JPEG, PNG ou WebP de até 2 MB.");
    };
  }

  static void checkSize(long contentLength) {
    if (contentLength <= 0 || contentLength > MAX_BYTES) {
      throw new IllegalArgumentException("Envie uma imagem JPEG, PNG ou WebP de até 2 MB.");
    }
  }

  static void checkHeader(String contentType, byte[] header) {
    byte[] bytes = header == null ? new byte[0] : header;
    boolean png = "image/png".equals(contentType) && bytes.length >= 8
        && Arrays.equals(Arrays.copyOf(bytes, 8), new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10});
    boolean jpeg = "image/jpeg".equals(contentType) && bytes.length >= 3
        && bytes[0] == (byte) 255 && bytes[1] == (byte) 216 && bytes[2] == (byte) 255;
    boolean webp = "image/webp".equals(contentType) && bytes.length >= 12
        && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
        && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
    if (!(png || jpeg || webp)) {
      throw new IllegalArgumentException("Envie uma imagem JPEG, PNG ou WebP de até 2 MB.");
    }
  }
}
