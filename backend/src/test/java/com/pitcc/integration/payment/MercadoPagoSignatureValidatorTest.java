package com.pitcc.integration.payment;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class MercadoPagoSignatureValidatorTest {

  private static final String SECRET = "webhook-secret";
  private static final Instant NOW = Instant.parse("2026-10-31T21:00:00Z");
  private static final String TS = String.valueOf(NOW.getEpochSecond());

  private final MercadoPagoSignatureValidator validator = new MercadoPagoSignatureValidator(SECRET);

  static String sign(String secret, String manifest) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    return HexFormat.of().formatHex(mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));
  }

  private static String header(String secret, String dataId, String ts) throws Exception {
    return "ts=" + ts + ",v1=" + sign(secret, "id:" + dataId + ";request-id:req-1;ts:" + ts + ";");
  }

  @Test
  void acceptsValidSignatureAndLowercasesDataId() throws Exception {
    assertTrue(validator.isValid(header(SECRET, "ord01abc", TS), "req-1", "ORD01ABC", NOW));
  }

  @Test
  void acceptsTimestampInMilliseconds() throws Exception {
    String ts = String.valueOf(NOW.toEpochMilli());
    assertTrue(validator.isValid(header(SECRET, "ord01", ts), "req-1", "ORD01", NOW));
  }

  @Test
  void rejectsWrongSecretOrTamperedData() throws Exception {
    assertFalse(validator.isValid(header("other", "ord01", TS), "req-1", "ORD01", NOW));
    assertFalse(validator.isValid(header(SECRET, "ord01", TS), "req-2", "ORD01", NOW));
    assertFalse(validator.isValid(header(SECRET, "ord01", TS), "req-1", "ORD02", NOW));
  }

  @Test
  void rejectsOldTimestamp() throws Exception {
    String old = String.valueOf(NOW.minusSeconds(600).getEpochSecond());
    assertFalse(validator.isValid(header(SECRET, "ord01", old), "req-1", "ORD01", NOW));
  }

  @Test
  void rejectsMissingOrMalformedHeaders() {
    assertFalse(validator.isValid(null, "req-1", "ORD01", NOW));
    assertFalse(validator.isValid("garbage", "req-1", "ORD01", NOW));
    assertFalse(validator.isValid("ts=abc,v1=00", "req-1", "ORD01", NOW));
    assertFalse(validator.isValid("ts=" + TS + ",v1=00", null, "ORD01", NOW));
  }

  @Test
  void rejectsEverythingWithoutSecret() throws Exception {
    MercadoPagoSignatureValidator unconfigured = new MercadoPagoSignatureValidator("");
    assertFalse(unconfigured.isValid(header(SECRET, "ord01", TS), "req-1", "ORD01", NOW));
  }
}
