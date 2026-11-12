package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.TransactionHistoryResponse;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.TransactionNotFoundException;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.ReviewService;
import com.pitcc.service.TransactionHistoryService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TransactionHistoryController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class TransactionHistoryControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private TransactionHistoryService transactionHistoryService;

  @MockitoBean private ReviewService reviewService;

  @MockitoBean private UserRepository userRepository;

  private String token;

  @BeforeEach
  void authenticate() {
    User user = new User();
    user.setId("u1");
    user.setRole(UserRole.USER);
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));
    token = "Bearer " + jwtService.generate("u1", UserRole.USER);
  }

  private static TransactionHistoryResponse response() {
    return new TransactionHistoryResponse(
        "tx-1",
        TransactionHistoryResponse.Type.PURCHASE,
        TransactionHistoryResponse.Status.COMPLETED,
        Instant.parse("2026-10-01T12:00:00Z"),
        new TransactionHistoryResponse.Counterparty("vendedor", "Vendedor"),
        List.of(
            new TransactionHistoryResponse.Item(
                "card-1", "Dark Magician", CardGame.YUGIOH, "Starter", "006", null,
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE, 2, new BigDecimal("10.00"),
                TransactionHistoryResponse.Direction.RECEIVED)),
        2,
        new BigDecimal("20.00"),
        null,
        null);
  }

  @Test
  void shouldRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/users/me/transactions")).andExpect(status().isUnauthorized());
    verify(transactionHistoryService, never()).findOwnTransactions(any(), any(), any(int.class), any(int.class));
  }

  @Test
  void shouldListOwnTransactionsFilteredByType() throws Exception {
    when(transactionHistoryService.findOwnTransactions(
            "u1", TransactionHistoryResponse.Type.PURCHASE, 0, 10))
        .thenReturn(new PageImpl<>(List.of(response()), PageRequest.of(0, 10), 1));

    mockMvc
        .perform(
            get("/api/users/me/transactions")
                .header(HttpHeaders.AUTHORIZATION, token)
                .param("type", "PURCHASE"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value("tx-1"))
        .andExpect(jsonPath("$.content[0].type").value("PURCHASE"))
        .andExpect(jsonPath("$.content[0].status").value("COMPLETED"))
        .andExpect(jsonPath("$.content[0].counterparty.username").value("vendedor"))
        .andExpect(jsonPath("$.content[0].items[0].quantity").value(2))
        .andExpect(jsonPath("$.content[0].totalAmount").value(20.0));
  }

  @Test
  void shouldRejectUnknownType() throws Exception {
    mockMvc
        .perform(
            get("/api/users/me/transactions")
                .header(HttpHeaders.AUTHORIZATION, token)
                .param("type", "GIFT"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldReturnNotFoundForTransactionOfAnotherUser() throws Exception {
    when(transactionHistoryService.findOwnTransaction("u1", "tx-9"))
        .thenThrow(new TransactionNotFoundException());

    mockMvc
        .perform(get("/api/users/me/transactions/tx-9").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Transação não encontrada."));
  }
}
