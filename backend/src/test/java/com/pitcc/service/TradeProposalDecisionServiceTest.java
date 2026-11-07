
package com.pitcc.service;

import com.pitcc.exception.TradeProposalConflictException;
import com.pitcc.exception.TradeProposalNotFoundException;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.repository.TradeProposalRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeProposalDecisionServiceTest {

    @Mock
    private TradeProposalRepository repository;

    @Mock
    private TradeProposalDecisionPolicy policy;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private TradeAvailabilityService availabilityService;

    @Mock
    private TradeProposal proposal;

    private TradeProposalDecisionService service;

    private static final String PROPOSAL_ID = "proposal-1";
    private static final String PROPOSER_ID = "user-1";
    private static final String RECIPIENT_ID = "user-2";

    @BeforeEach
    void setUp() {
        service = new TradeProposalDecisionService(
                repository,
                policy,
                mongoTemplate,
                availabilityService
        );
    }


    private void mockPendingProposal() {
        when(repository.findById(PROPOSAL_ID))
                .thenReturn(Optional.of(proposal));

        when(proposal.getStatus())
                .thenReturn(TradeProposalStatus.PENDING);

        when(proposal.getProposerId())
                .thenReturn(PROPOSER_ID);

        when(proposal.getRecipientId())
                .thenReturn(RECIPIENT_ID);
    }


    private void mockSuccessfulUpdate(
            TradeProposalStatus status
    ) {
        TradeProposal updated = mock(TradeProposal.class);

        when(updated.getStatus()).thenReturn(status);

        when(mongoTemplate.findAndModify(
                any(Query.class),
                any(Update.class),
                any(FindAndModifyOptions.class),
                eq(TradeProposal.class)
        )).thenReturn(updated);
    }

    @Test
    void shouldAcceptPendingProposal() {
        mockPendingProposal();
        when(proposal.getVersion()).thenReturn(0L);
        when(proposal.getAdId()).thenReturn("ad-1");
        when(proposal.getOfferedItems()).thenReturn(List.of());
        when(proposal.getRequestedItems()).thenReturn(List.of());

        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.ACCEPT,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                RECIPIENT_ID
        )).thenReturn("ACCEPTED");

        mockSuccessfulUpdate(TradeProposalStatus.ACCEPTED);

        TradeProposalStatus result =
                service.accept(PROPOSAL_ID, RECIPIENT_ID);

        assertEquals(TradeProposalStatus.ACCEPTED, result);

        verify(availabilityService).validate(any(
                TradeAvailabilityService.TradeContext.class
        ));

        verify(mongoTemplate).findAndModify(
                any(Query.class),
                any(Update.class),
                any(FindAndModifyOptions.class),
                eq(TradeProposal.class)
        );
    }

    @Test
    void shouldRejectPendingProposal() {
        mockPendingProposal();
        when(proposal.getVersion()).thenReturn(0L);
        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.REJECT,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                RECIPIENT_ID
        )).thenReturn("REJECTED");

        mockSuccessfulUpdate(TradeProposalStatus.REJECTED);

        TradeProposalStatus result =
                service.reject(PROPOSAL_ID, RECIPIENT_ID);

        assertEquals(TradeProposalStatus.REJECTED, result);

        verifyNoInteractions(availabilityService);
    }

    @Test
    void shouldCancelPendingProposal() {
        mockPendingProposal();
        when(proposal.getVersion()).thenReturn(0L);
        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.CANCEL,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                PROPOSER_ID
        )).thenReturn("CANCELLED");

        mockSuccessfulUpdate(TradeProposalStatus.CANCELLED);

        TradeProposalStatus result =
                service.cancel(PROPOSAL_ID, PROPOSER_ID);

        assertEquals(TradeProposalStatus.CANCELLED, result);

        verifyNoInteractions(availabilityService);
    }

    @Test
    void shouldRejectUnauthorizedDecision() {
        mockPendingProposal();
        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.REJECT,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                PROPOSER_ID
        )).thenThrow(new AccessDeniedException(
                "Apenas o destinatario pode recusar."
        ));

        assertThrows(
                AccessDeniedException.class,
                () -> service.reject(PROPOSAL_ID, PROPOSER_ID)
        );

        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void shouldNotModifyFinalizedProposal() {
        when(repository.findById(PROPOSAL_ID))
                .thenReturn(Optional.of(proposal));

        when(proposal.getStatus())
                .thenReturn(TradeProposalStatus.REJECTED);

        when(proposal.getProposerId())
                .thenReturn(PROPOSER_ID);

        when(proposal.getRecipientId())
                .thenReturn(RECIPIENT_ID);

        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.ACCEPT,
                "REJECTED",
                PROPOSER_ID,
                RECIPIENT_ID,
                RECIPIENT_ID
        )).thenThrow(new TradeProposalConflictException(
                "A proposta nao esta pendente."
        ));

        assertThrows(
                TradeProposalConflictException.class,
                () -> service.accept(PROPOSAL_ID, RECIPIENT_ID)
        );

        verifyNoInteractions(availabilityService, mongoTemplate);
    }

    @Test
    void shouldRejectConcurrentModification() {
        mockPendingProposal();
        when(proposal.getVersion()).thenReturn(0L);
        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.REJECT,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                RECIPIENT_ID
        )).thenReturn("REJECTED");

        // O MongoDB nao encontrou uma proposta que
        // corresponda simultaneamente ao status e versao.
        assertThrows(
                TradeProposalConflictException.class,
                () -> service.reject(PROPOSAL_ID, RECIPIENT_ID)
        );
    }

    @Test
    void shouldRejectNonexistentProposal() {
        when(repository.findById(PROPOSAL_ID))
                .thenReturn(Optional.empty());

        assertThrows(
                TradeProposalNotFoundException.class,
                () -> service.reject(PROPOSAL_ID, RECIPIENT_ID)
        );

        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void shouldNotRevealProposalToNonParticipant() {
        when(repository.findById(PROPOSAL_ID))
                .thenReturn(Optional.of(proposal));

        when(proposal.getProposerId()).thenReturn(PROPOSER_ID);
        when(proposal.getRecipientId()).thenReturn(RECIPIENT_ID);

        String externalUserId = "user-3";

        assertThrows(
                TradeProposalNotFoundException.class,
                () -> service.reject(PROPOSAL_ID, externalUserId)
        );

        verifyNoInteractions(policy, availabilityService, mongoTemplate);
    }

    @Test
    void shouldNotAcceptWhenAvailabilityValidationFails() {
        mockPendingProposal();

        when(proposal.getAdId()).thenReturn("ad-1");
        when(proposal.getOfferedItems()).thenReturn(List.of());
        when(proposal.getRequestedItems()).thenReturn(List.of());

        when(policy.nextStatus(
                TradeProposalDecisionPolicy.Action.ACCEPT,
                "PENDING",
                PROPOSER_ID,
                RECIPIENT_ID,
                RECIPIENT_ID
        )).thenReturn("ACCEPTED");

        doThrow(new TradeProposalConflictException(
                "As cartas não estão mais disponíveis."
        )).when(availabilityService).validate(
                any(TradeAvailabilityService.TradeContext.class)
        );

        assertThrows(
                TradeProposalConflictException.class,
                () -> service.accept(PROPOSAL_ID, RECIPIENT_ID)
        );

        verify(availabilityService).validate(
                any(TradeAvailabilityService.TradeContext.class)
        );

        verifyNoInteractions(mongoTemplate);
    }

}
