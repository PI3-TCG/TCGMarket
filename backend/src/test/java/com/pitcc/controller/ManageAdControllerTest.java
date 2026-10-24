package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.CollectionCardResponse;
import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;
import com.pitcc.exception.AdNotActiveException;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.AdModality;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.ManageAdService;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ManageAdController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class ManageAdControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private ManageAdService manageAdService;

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

  private static OwnAdResponse response(AdStatus status, Integer released) {
    return new OwnAdResponse(
        "ad-1",
        "item-1",
        status,
        3,
        2,
        true,
        false,
        new BigDecimal("45.00"),
        CardCondition.NEAR_MINT,
        CardLanguage.PORTUGUESE,
        new CollectionCardResponse(
            "card-1", "Dark Magician", CardGame.YUGIOH, "Starter", "006", "Ultra Rare", null),
        Instant.parse("2026-10-19T18:00:00Z"),
        Instant.parse("2026-10-19T18:00:00Z"),
        null,
        released);
  }

  @Test
  void shouldRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/users/me/ads")).andExpect(status().isUnauthorized());
    verify(manageAdService, never()).findOwnAds(any(), eq(0), eq(20), any());
  }

  @Test
  void shouldListOwnAdsWithFilters() throws Exception {
    OwnAdFilters filters = new OwnAdFilters("dark", CardGame.YUGIOH, AdModality.SALE, AdStatus.ACTIVE);
    when(manageAdService.findOwnAds("u1", 0, 20, filters))
        .thenReturn(
            new PageImpl<>(List.of(response(AdStatus.ACTIVE, null)), PageRequest.of(0, 20), 1));

    mockMvc
        .perform(
            get("/api/users/me/ads")
                .header(HttpHeaders.AUTHORIZATION, token)
                .param("search", "dark")
                .param("game", "YUGIOH")
                .param("modality", "SALE")
                .param("status", "ACTIVE"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value("ad-1"))
        .andExpect(jsonPath("$.content[0].card.name").value("Dark Magician"))
        .andExpect(jsonPath("$.content[0].unitPrice").value(45.0));
  }

  @Test
  void shouldRejectUnknownStatusFilter() throws Exception {
    mockMvc
        .perform(
            get("/api/users/me/ads")
                .header(HttpHeaders.AUTHORIZATION, token)
                .param("status", "DELETED"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldReturnNotFoundForAdOfAnotherUser() throws Exception {
    when(manageAdService.findOwnAd("u1", "ad-9")).thenThrow(new AdNotFoundException());

    mockMvc
        .perform(get("/api/users/me/ads/ad-9").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Anúncio não encontrado."));
  }

  @Test
  void shouldUpdateModalityAndPrice() throws Exception {
    when(manageAdService.updateOwnAd(eq("u1"), eq("ad-1"), any(UpdateAdRequest.class)))
        .thenReturn(response(AdStatus.ACTIVE, null));

    mockMvc
        .perform(
            patch("/api/users/me/ads/ad-1")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "saleEnabled": true, "tradeEnabled": false, "unitPrice": 45.00 }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.saleEnabled").value(true));
  }

  @Test
  void shouldRejectInvalidPriceOnUpdate() throws Exception {
    mockMvc
        .perform(
            patch("/api/users/me/ads/ad-1")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "saleEnabled": true, "tradeEnabled": false, "unitPrice": 0 }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Revise os dados do anúncio."))
        .andExpect(jsonPath("$.fields[0].field").value("unitPrice"));

    verify(manageAdService, never()).updateOwnAd(any(), any(), any());
  }

  @Test
  void shouldReturnConflictWithCurrentStatus() throws Exception {
    when(manageAdService.cancelOwnAd("u1", "ad-1"))
        .thenThrow(new AdNotActiveException(AdStatus.SOLD_OUT));

    mockMvc
        .perform(post("/api/users/me/ads/ad-1/cancel").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("O status do anúncio mudou."))
        .andExpect(jsonPath("$.fields[0].field").value("status"))
        .andExpect(jsonPath("$.fields[0].message").value("SOLD_OUT"));
  }

  @Test
  void shouldCancelOwnAd() throws Exception {
    when(manageAdService.cancelOwnAd("u1", "ad-1")).thenReturn(response(AdStatus.CANCELLED, 2));

    mockMvc
        .perform(post("/api/users/me/ads/ad-1/cancel").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CANCELLED"))
        .andExpect(jsonPath("$.releasedQuantity").value(2));
  }
}
