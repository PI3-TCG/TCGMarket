package com.pitcc.integration.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.pitcc.integration.payment.PaymentGateway.GatewayPayment;
import com.pitcc.integration.payment.PaymentGateway.PaymentRequest;
import com.pitcc.model.PaymentStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class MercadoPagoPaymentGatewayTest {

  private static final String BASE = "https://mp.test";

  private MockRestServiceServer server;
  private MercadoPagoPaymentGateway gateway;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder().baseUrl(BASE);
    server = MockRestServiceServer.bindTo(builder).build();
    gateway = new MercadoPagoPaymentGateway(builder.build(), "https://hml/webhook", "APRO");
  }

  private static String order(String status, String detail, boolean liveMode) {
    return """
        {"id":"ORD01","status":"%s","status_detail":"%s","live_mode":%s,"total_amount":"45.00"}
        """.formatted(status, detail, liveMode);
  }

  @Test
  void createsPixOrderWithIdempotencyKey() {
    server
        .expect(requestTo(BASE + "/v1/orders"))
        .andExpect(method(HttpMethod.POST))
        .andExpect(header("X-Idempotency-Key", "key-1"))
        .andExpect(jsonPath("$.external_reference").value("order-1"))
        .andExpect(jsonPath("$.total_amount").value("45.00"))
        .andExpect(jsonPath("$.transactions.payments[0].amount").value("45.00"))
        .andExpect(jsonPath("$.transactions.payments[0].payment_method.id").value("pix"))
        .andExpect(jsonPath("$.payer.email").value("ana@test.com"))
        .andExpect(jsonPath("$.payer.first_name").value("APRO"))
        .andExpect(jsonPath("$.notification_url").value("https://hml/webhook"))
        .andRespond(
            withSuccess(order("action_required", "waiting_transfer", false), MediaType.APPLICATION_JSON));

    GatewayPayment result =
        gateway.create(new PaymentRequest("key-1", "order-1", new BigDecimal("45"), "ana@test.com"));

    assertEquals("ORD01", result.providerPaymentId());
    assertEquals(PaymentStatus.PENDING, result.status());
    server.verify();
  }

  @Test
  void fetchesApprovedOrder() {
    server
        .expect(requestTo(BASE + "/v1/orders/ORD01"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(order("processed", "accredited", false), MediaType.APPLICATION_JSON));

    assertEquals(PaymentStatus.APPROVED, gateway.fetch("ORD01").status());
  }

  @Test
  void mapsOrderStatuses() {
    assertEquals(PaymentStatus.REJECTED, MercadoPagoPaymentGateway.status("failed", "failed"));
    assertEquals(PaymentStatus.EXPIRED, MercadoPagoPaymentGateway.status("failed", "expired"));
    assertEquals(PaymentStatus.CANCELLED, MercadoPagoPaymentGateway.status("canceled", "canceled"));
    assertEquals(PaymentStatus.EXPIRED, MercadoPagoPaymentGateway.status("canceled", "expired"));
    assertEquals(PaymentStatus.PENDING, MercadoPagoPaymentGateway.status("processing", null));
    assertEquals(PaymentStatus.PENDING, MercadoPagoPaymentGateway.status("refunded", "refunded"));
  }

  @Test
  void refusesLiveModeResponse() {
    server
        .expect(requestTo(BASE + "/v1/orders/ORD01"))
        .andRespond(withSuccess(order("processed", "accredited", true), MediaType.APPLICATION_JSON));

    assertThrows(PaymentGatewayException.class, () -> gateway.fetch("ORD01"));
  }

  @Test
  void wrapsServerErrorsAndRateLimit() {
    server.expect(requestTo(BASE + "/v1/orders/ORD01")).andRespond(withServerError());
    server
        .expect(requestTo(BASE + "/v1/orders/ORD02"))
        .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

    assertThrows(PaymentGatewayException.class, () -> gateway.fetch("ORD01"));
    assertThrows(PaymentGatewayException.class, () -> gateway.fetch("ORD02"));
  }
}
