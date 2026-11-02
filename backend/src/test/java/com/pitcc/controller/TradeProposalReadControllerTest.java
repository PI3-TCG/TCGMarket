package com.pitcc.controller;

import com.pitcc.dto.TradeProposalDirection;
import com.pitcc.dto.TradeProposalViewResponse;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.TradeProposalNotFoundException;
import com.pitcc.exception.TradeProposalReadExceptionHandler;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.TradeProposalReadService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TradeProposalReadController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class,
        GlobalExceptionHandler.class, TradeProposalReadExceptionHandler.class})
@TestPropertySource(properties = {
        "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
        "security.jwt.expiration=1h"
})
class TradeProposalReadControllerTest {
    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;
    @MockitoBean TradeProposalReadService service;
    @MockitoBean UserRepository users;
    String token;

    @BeforeEach
    void setup() {
        User u = new User();
        u.setId("alice");
        u.setRole(UserRole.USER);
        when(users.findById("alice")).thenReturn(Optional.of(u));
        token = "Bearer " + jwtService.generate("alice", UserRole.USER);
    }

    private static TradeProposalViewResponse sample() {
        return new TradeProposalViewResponse(
                "proposal-1", "ad-1", TradeProposalDirection.SENT,
                TradeProposalStatus.PENDING, Instant.parse("2026-11-01T12:00:00Z"),
                Instant.parse("2026-11-01T12:00:00Z"),
                null, null, null, null,
                new TradeProposalViewResponse.Participant("alice", "aline", "Aline"),
                new TradeProposalViewResponse.Participant("bob", "caelus", "Caelus"),
                List.of(), List.of(), null, List.of());
    }

    @Test
    void listAndDetailRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me/trade-proposals").param("direction", "sent"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/trade-proposals/proposal-1"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void listSentWithPaginationAndStatus() throws Exception {
        when(service.findOwnProposals("alice", "sent", TradeProposalStatus.PENDING, 0, 10))
                .thenReturn(new PageImpl<>(List.of(sample()), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/users/me/trade-proposals")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .param("direction", "sent")
                        .param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("proposal-1"))
                .andExpect(jsonPath("$.content[0].status").value("PENDING"))
                .andExpect(jsonPath("$.content[0].recipient.username").value("caelus"))
                .andExpect(jsonPath("$.content[0].proposer.email").doesNotExist());
    }

    @Test
    void detailReturnsNegotiationWithoutPrivateUserFields() throws Exception {
        when(service.findOwnProposal("alice", "proposal-1")).thenReturn(sample());
        mockMvc.perform(get("/api/trade-proposals/proposal-1")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("proposal-1"))
                .andExpect(jsonPath("$.direction").value("SENT"))
                .andExpect(jsonPath("$.proposer.name").value("Aline"))
                .andExpect(jsonPath("$.requestKey").doesNotExist());
    }

    @Test
    void thirdPartyAndMissingProposalShareNotFoundMessage() throws Exception {
        when(service.findOwnProposal("alice", "secret"))
                .thenThrow(new TradeProposalNotFoundException());
        mockMvc.perform(get("/api/trade-proposals/secret")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Proposta não encontrada."));
    }

    @Test
    void invalidStatusIsBadRequest() throws Exception {
        mockMvc.perform(get("/api/users/me/trade-proposals")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .param("direction", "received")
                        .param("status", "DECLINED"))
                .andExpect(status().isBadRequest());
    }
}
