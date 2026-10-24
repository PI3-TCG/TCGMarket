package com.pitcc.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.dto.CreateAdRequest;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.model.AdStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CreateAdService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CreateAdController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class CreateAdControllerTest {

  private static final String VALID_BODY =
      """
      {
        "collectionItemId": "item-1",
        "quantity": 2,
        "saleEnabled": true,
        "tradeEnabled": true,
        "unitPrice": 45.00
      }
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private CreateAdService createAdService;

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

  private org.springframework.test.web.servlet.ResultActions postAd(String body) throws Exception {
    return mockMvc.perform(
        post("/api/users/me/ads")
            .header(HttpHeaders.AUTHORIZATION, token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(body));
  }

  @Test
  void shouldRequireAuthentication() throws Exception {
    mockMvc
        .perform(
            post("/api/users/me/ads").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isUnauthorized());

    verify(createAdService, never()).createAd(any(), any());
  }

  @Test
  void shouldCreateAdForAuthenticatedUser() throws Exception {
    when(createAdService.createAd(eq("u1"), any(CreateAdRequest.class)))
        .thenReturn(
            new AdResponse(
                "ad-1",
                "item-1",
                AdStatus.ACTIVE,
                2,
                2,
                true,
                true,
                new BigDecimal("45.00"),
                null,
                Instant.parse("2026-10-19T18:00:00Z"),
                new CollectionItemAvailabilityResponse(5, 4, 1)));

    postAd(VALID_BODY)
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("ad-1"))
        .andExpect(jsonPath("$.status").value("ACTIVE"))
        .andExpect(jsonPath("$.unitPrice").value(45.0))
        .andExpect(jsonPath("$.availability.availableQuantity").value(1));

    ArgumentCaptor<CreateAdRequest> captor = ArgumentCaptor.forClass(CreateAdRequest.class);
    verify(createAdService).createAd(eq("u1"), captor.capture());
    assertEquals(new BigDecimal("45.00"), captor.getValue().unitPrice());
  }

  @Test
  void shouldRejectInvalidQuantityAndPrice() throws Exception {
    postAd(
            """
            {
              "collectionItemId": "item-1",
              "quantity": 0,
              "saleEnabled": true,
              "tradeEnabled": false,
              "unitPrice": 10.999
            }
            """)
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Revise os dados do anúncio."));

    verify(createAdService, never()).createAd(any(), any());
  }

  @Test
  void shouldReturnFieldErrorWhenNoModalityIsSelected() throws Exception {
    when(createAdService.createAd(eq("u1"), any(CreateAdRequest.class)))
        .thenThrow(new InvalidAdException("modality", "Selecione uma modalidade."));

    postAd(
            """
            {
              "collectionItemId": "item-1",
              "quantity": 1,
              "saleEnabled": false,
              "tradeEnabled": false
            }
            """)
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fields[0].field").value("modality"));
  }

  @Test
  void shouldReturnNotFoundForItemOfAnotherUser() throws Exception {
    when(createAdService.createAd(eq("u1"), any(CreateAdRequest.class)))
        .thenThrow(new CollectionItemNotFoundException());

    postAd(VALID_BODY).andExpect(status().isNotFound());
  }

  @Test
  void shouldReturnConflictWhenQuantityIsUnavailable() throws Exception {
    when(createAdService.createAd(eq("u1"), any(CreateAdRequest.class)))
        .thenThrow(new AdQuantityUnavailableException(1));

    postAd(VALID_BODY)
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("A disponibilidade mudou. Agora há apenas 1 exemplar disponível."))
        .andExpect(jsonPath("$.fields[0].field").value("quantity"));
  }
}
