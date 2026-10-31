package com.pitcc.integration.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class PaymentConfigTest {

  private final PaymentConfig config = new PaymentConfig();

  private static PaymentProperties properties(PaymentProvider provider, String token) {
    return new PaymentProperties(
        provider,
        new PaymentProperties.Simulated(PaymentStatus.REJECTED),
        new PaymentProperties.MercadoPago(
            "https://api.mercadopago.com", token, "secret", null, "APRO", Duration.ofSeconds(5)),
        null);
  }

  @Test
  void usesSimulatorByDefault() {
    PaymentGateway gateway = config.paymentGateway(properties(null, null));

    assertEquals(PaymentProvider.SIMULATED, gateway.provider());
    assertEquals(PaymentStatus.REJECTED, gateway.create(
        new PaymentGateway.PaymentRequest("k", "o", java.math.BigDecimal.TEN, null)).status());
  }

  @Test
  void requiresAccessTokenForMercadoPago() {
    assertThrows(
        IllegalStateException.class,
        () -> config.paymentGateway(properties(PaymentProvider.MERCADO_PAGO, " ")));
  }

  @Test
  void createsMercadoPagoGatewayWithToken() {
    PaymentGateway gateway =
        config.paymentGateway(properties(PaymentProvider.MERCADO_PAGO, "APP_USR-test"));

    assertEquals(PaymentProvider.MERCADO_PAGO, gateway.provider());
  }

  @Test
  void hidesSecretsInToString() {
    String text = properties(PaymentProvider.MERCADO_PAGO, "APP_USR-test").mercadopago().toString();

    assertEquals(false, text.contains("APP_USR-test") || text.contains("secret,"));
  }
}
