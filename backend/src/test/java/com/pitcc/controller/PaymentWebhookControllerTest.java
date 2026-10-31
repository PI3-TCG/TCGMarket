package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.integration.payment.MercadoPagoSignatureValidator;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PaymentWebhookController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class PaymentWebhookControllerTest {

  private static final String URL = "/api/payments/webhooks/mercadopago?data.id=ORD01&type=order";

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MercadoPagoSignatureValidator signatureValidator;
  @MockitoBean private PaymentService paymentService;
  @MockitoBean private UserRepository userRepository;

  @Test
  void processesSignedNotificationWithoutLogin() throws Exception {
    when(signatureValidator.isValid(eq("ts=1,v1=abc"), eq("req-1"), eq("ORD01"), any()))
        .thenReturn(true);

    mockMvc
        .perform(
            post(URL)
                .header("x-signature", "ts=1,v1=abc")
                .header("x-request-id", "req-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"order\",\"live_mode\":false,\"data\":{\"id\":\"ORD01\"}}"))
        .andExpect(status().isOk());

    verify(paymentService).handleNotification("ORD01");
  }

  @Test
  void rejectsInvalidSignature() throws Exception {
    when(signatureValidator.isValid(any(), any(), any(), any())).thenReturn(false);

    mockMvc
        .perform(post(URL).header("x-signature", "ts=1,v1=bad").header("x-request-id", "req-1"))
        .andExpect(status().isUnauthorized());

    verifyNoInteractions(paymentService);
  }

  @Test
  void rejectsLiveModeNotification() throws Exception {
    when(signatureValidator.isValid(anyString(), anyString(), anyString(), any())).thenReturn(true);

    mockMvc
        .perform(
            post(URL)
                .header("x-signature", "ts=1,v1=abc")
                .header("x-request-id", "req-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"live_mode\":true}"))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(paymentService);
  }
}
