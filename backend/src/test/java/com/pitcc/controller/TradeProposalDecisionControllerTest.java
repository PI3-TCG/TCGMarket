
package com.pitcc.controller;

import com.pitcc.exception.*;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CreateTradeProposalService;
import com.pitcc.service.TradeProposalDecisionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TradeProposalController.class)
@Import({
        SecurityConfig.class,
        JwtService.class,
        ApiErrorWriter.class,
        GlobalExceptionHandler.class,
        TradeProposalCreationExceptionHandler.class,
        TradeProposalReadExceptionHandler.class,
        TradeProposalDecisionExceptionHandler.class
})
@TestPropertySource(properties = {
        "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
        "security.jwt.expiration=1h"
})
class TradeProposalDecisionControllerTest {

    private static final String PROPOSAL_ID = "proposal-1";
    private static final String USER_ID = "user-2";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private CreateTradeProposalService createService;

    @MockitoBean
    private TradeProposalDecisionService decisionService;

    @MockitoBean
    private UserRepository userRepository;

    private String token;

    @BeforeEach
    void setup() {
        User user = new User();
        user.setId(USER_ID);
        user.setRole(UserRole.USER);

        when(userRepository.findById(USER_ID))
                .thenReturn(Optional.of(user));

        token = "Bearer " + jwtService.generate(
                USER_ID,
                UserRole.USER
        );
    }

    @Test
    void shouldAcceptProposal() throws Exception {
        when(decisionService.accept(PROPOSAL_ID, USER_ID))
                .thenReturn(TradeProposalStatus.ACCEPTED);

        mockMvc.perform(
                        patch("/api/trade-proposals/{id}/accept", PROPOSAL_ID)
                                .header(HttpHeaders.AUTHORIZATION, token)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(decisionService).accept(PROPOSAL_ID, USER_ID);
    }

    @Test
    void shouldRejectProposal() throws Exception {
        when(decisionService.reject(PROPOSAL_ID, USER_ID))
                .thenReturn(TradeProposalStatus.REJECTED);

        mockMvc.perform(
                        patch("/api/trade-proposals/{id}/reject", PROPOSAL_ID)
                                .header(HttpHeaders.AUTHORIZATION, token)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        verify(decisionService).reject(PROPOSAL_ID, USER_ID);
    }

    @Test
    void shouldCancelProposal() throws Exception {
        when(decisionService.cancel(PROPOSAL_ID, USER_ID))
                .thenReturn(TradeProposalStatus.CANCELLED);

        mockMvc.perform(
                        patch("/api/trade-proposals/{id}/cancel", PROPOSAL_ID)
                                .header(HttpHeaders.AUTHORIZATION, token)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(decisionService).cancel(PROPOSAL_ID, USER_ID);
    }

    @Test
    void shouldRequireAuthentication() throws Exception {
        mockMvc.perform(
                patch("/api/trade-proposals/{id}/accept", PROPOSAL_ID)
        ).andExpect(status().isUnauthorized());

        mockMvc.perform(
                patch("/api/trade-proposals/{id}/reject", PROPOSAL_ID)
        ).andExpect(status().isUnauthorized());

        mockMvc.perform(
                patch("/api/trade-proposals/{id}/cancel", PROPOSAL_ID)
        ).andExpect(status().isUnauthorized());

        verifyNoInteractions(decisionService);
    }

    @Test
    void shouldRejectUnauthorizedUser() throws Exception {
        when(decisionService.accept(PROPOSAL_ID, USER_ID))
                .thenThrow(new AccessDeniedException(
                        "Operacao nao permitida."
                ));

        mockMvc.perform(
                        patch("/api/trade-proposals/{id}/accept", PROPOSAL_ID)
                                .header(HttpHeaders.AUTHORIZATION, token)
                )
                .andExpect(status().isForbidden());

        verify(decisionService).accept(PROPOSAL_ID, USER_ID);
    }

    @Test
    void shouldReturnConflictForFinalizedProposal()
            throws Exception {

        when(decisionService.accept(PROPOSAL_ID, USER_ID))
                .thenThrow(new TradeProposalConflictException(
                        "A proposta nao esta pendente."
                ));

        mockMvc.perform(
                        patch("/api/trade-proposals/{id}/accept", PROPOSAL_ID)
                                .header(HttpHeaders.AUTHORIZATION, token)
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }
}
