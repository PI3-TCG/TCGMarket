package com.pitcc.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.pitcc.model.UserRole;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET = "test-secret-key-must-be-at-least-32-bytes!";

  private final JwtService jwtService = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1)));

  @Test
  void shouldIssueTokenWithUserIdAndRoleOnly() {
    String token = jwtService.generate("abc123", UserRole.USER);

    Optional<AuthenticatedUser> parsed = jwtService.parse(token);

    assertTrue(parsed.isPresent());
    assertEquals("abc123", parsed.get().id());
    assertEquals(UserRole.USER, parsed.get().role());
    assertEquals(3, token.split("\\.").length);
  }

  @Test
  void shouldRejectTamperedToken() {
    String token = jwtService.generate("abc123", UserRole.ADMIN);
    String tampered = token.substring(0, token.length() - 2) + "xx";

    assertTrue(jwtService.parse(tampered).isEmpty());
  }

  @Test
  void shouldRejectExpiredToken() throws Exception {
    String token = signedToken(Instant.now().minusSeconds(60), "USER");

    assertTrue(jwtService.parse(token).isEmpty());
  }

  @Test
  void shouldRejectSecretShorterThan32Bytes() {
    IllegalStateException exception =
        assertThrows(
            IllegalStateException.class,
            () -> new JwtService(new JwtProperties("curto", Duration.ofHours(1))));

    assertEquals("JWT_SECRET precisa ter pelo menos 32 bytes em UTF-8.", exception.getMessage());
  }

  @Test
  void shouldIgnoreTokenSignedWithAnotherSecret() {
    JwtService other = new JwtService(new JwtProperties(SECRET + "-other-secret", Duration.ofHours(1)));
    String token = other.generate("abc123", UserRole.USER);

    assertTrue(jwtService.parse(token).isEmpty());
  }

  @Test
  void shouldRejectTokenWithoutExpiration() throws Exception {
    String token = signedToken(null, "USER");

    assertTrue(jwtService.parse(token).isEmpty());
  }

  private String signedToken(Instant expiration, String role) throws Exception {
    JWTClaimsSet.Builder claims =
        new JWTClaimsSet.Builder().subject("abc123").claim("role", role).issueTime(new Date());
    if (expiration != null) {
      claims.expirationTime(Date.from(expiration));
    }
    SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims.build());
    jwt.sign(new MACSigner(SECRET.getBytes(StandardCharsets.UTF_8)));
    return jwt.serialize();
  }
}
