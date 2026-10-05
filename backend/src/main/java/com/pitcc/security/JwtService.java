package com.pitcc.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.pitcc.model.UserRole;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class JwtService {

  static final int MINIMUM_SECRET_BYTES = 32;

  private final byte[] secret;
  private final Duration expiration;

  public JwtService(JwtProperties properties) {
    byte[] secretBytes =
        properties.secret() == null ? new byte[0] : properties.secret().getBytes(StandardCharsets.UTF_8);
    if (secretBytes.length < MINIMUM_SECRET_BYTES) {
      throw new IllegalStateException("JWT_SECRET precisa ter pelo menos 32 bytes em UTF-8.");
    }
    if (properties.expiration() == null
        || properties.expiration().isZero()
        || properties.expiration().isNegative()) {
      throw new IllegalStateException("A validade do token precisa ser positiva.");
    }
    this.secret = secretBytes;
    this.expiration = properties.expiration();
  }

  public String generate(String userId, UserRole role) {
    Instant now = Instant.now();
    JWTClaimsSet claims =
        new JWTClaimsSet.Builder()
            .subject(userId)
            .claim("role", role.name())
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plus(expiration)))
            .build();
    SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
    try {
      jwt.sign(new MACSigner(secret));
    } catch (JOSEException exception) {
      throw new IllegalStateException("Não foi possível emitir o token.", exception);
    }
    return jwt.serialize();
  }

  public Optional<AuthenticatedUser> parse(String token) {
    try {
      SignedJWT jwt = SignedJWT.parse(token);
      if (!jwt.verify(new MACVerifier(secret))) {
        return Optional.empty();
      }
      JWTClaimsSet claims = jwt.getJWTClaimsSet();
      Date expirationTime = claims.getExpirationTime();
      if (expirationTime == null || !expirationTime.toInstant().isAfter(Instant.now())) {
        return Optional.empty();
      }
      String userId = claims.getSubject();
      String roleName = claims.getStringClaim("role");
      if (userId == null || userId.isBlank() || roleName == null) {
        return Optional.empty();
      }
      return Optional.of(new AuthenticatedUser(userId, UserRole.valueOf(roleName)));
    } catch (ParseException | JOSEException | IllegalArgumentException exception) {
      return Optional.empty();
    }
  }
}
