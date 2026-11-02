package com.pitcc.controller;

import com.pitcc.dto.CreateTradeProposalRequest;
import com.pitcc.dto.TradeProposalResponse;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.TradeProposalCreationException;
import com.pitcc.exception.TradeProposalCreationExceptionHandler;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CreateTradeProposalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TradeProposalController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class,
        GlobalExceptionHandler.class, TradeProposalCreationExceptionHandler.class})
@TestPropertySource(properties = {
        "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
        "security.jwt.expiration=1h"
})
class TradeProposalControllerTest {
    private static final String REQUEST_BODY = """
            {
              "adId": "ad-1",
              "requestedQuantity": 1,
              "offeredItems": [
                {"collectionItemId": "own-1", "quantity": 2},
                {"collectionItemId": "own-2", "quantity": 1}
              ],
              "financialAdjustment": null,
              "requestKey": "sample-request-key"
            }
            """;

    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;
    @MockitoBean CreateTradeProposalService service;
    @MockitoBean UserRepository userRepository;
    private String token;

    @BeforeEach
    void authenticate() {
        User user = new User();
        user.setId("u1");
        user.setRole(UserRole.USER);
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        token = "Bearer " + jwtService.generate("u1", UserRole.USER);
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/trade-proposals")
                        .contentType(MediaType.APPLICATION_JSON).content(REQUEST_BODY))
                .andExpect(status().isUnauthorized());
        verify(service, never()).create(any(), any());
    }

    @Test
    void returnsCreatedAndPendingForValidRequest() throws Exception {
        when(service.create(eq("u1"), any(CreateTradeProposalRequest.class)))
                .thenReturn(new TradeProposalResponse(
                        "proposal-1", "u1", "u2", "ad-1", TradeProposalStatus.PENDING,
                        Instant.parse("2026-11-01T20:00:00Z"), List.of(), List.of(), null));

        mockMvc.perform(post("/api/trade-proposals")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content(REQUEST_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("proposal-1"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.recipientId").value("u2"));
    }

    @Test
    void rejectsInvalidOfferedQuantityBeforeCallingService() throws Exception {
        String body = """
                {"adId":"ad-1","requestedQuantity":1,
                 "offeredItems":[{"collectionItemId":"own-1","quantity":0}]}
                """;
        mockMvc.perform(post("/api/trade-proposals")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        verify(service, never()).create(any(), any());
    }

    @Test
    void rejectsItemOfAnotherUserWithNotFound() throws Exception {
        when(service.create(eq("u1"), any(CreateTradeProposalRequest.class)))
                .thenThrow(TradeProposalCreationException.missing(
                        "offeredItems", "Carta oferecida nao encontrada na sua colecao."));
        mockMvc.perform(post("/api/trade-proposals")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content(REQUEST_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.fields[0].field").value("offeredItems"));
    }
}
