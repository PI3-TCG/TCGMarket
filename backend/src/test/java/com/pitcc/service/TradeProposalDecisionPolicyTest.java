
package com.pitcc.service;

import com.pitcc.exception.TradeProposalConflictException;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;
import static com.pitcc.service.TradeProposalDecisionPolicy.Action.*;

class TradeProposalDecisionPolicyTest {

    private final TradeProposalDecisionPolicy policy =
            new TradeProposalDecisionPolicy();

    @Test
    void shouldAllowRecipientToAcceptPendingProposal() {
        String result = policy.nextStatus(
                ACCEPT, "PENDING", "user-1", "user-2", "user-2"
        );

        assertEquals("ACCEPTED", result);
    }

    @Test
    void shouldAllowRecipientToRejectPendingProposal() {
        String result = policy.nextStatus(
                REJECT, "PENDING", "user-1", "user-2", "user-2"
        );

        assertEquals("REJECTED", result);
    }

    @Test
    void shouldAllowProposerToCancelPendingProposal() {
        String result = policy.nextStatus(
                CANCEL, "PENDING", "user-1", "user-2", "user-1"
        );

        assertEquals("CANCELLED", result);
    }

    @Test
    void shouldRejectAcceptByProposer() {
        assertThrows(
                AccessDeniedException.class,
                () -> policy.nextStatus(
                        ACCEPT, "PENDING",
                        "user-1", "user-2", "user-1"
                )
        );
    }

    @Test
    void shouldRejectCancelByRecipient() {
        assertThrows(
                AccessDeniedException.class,
                () -> policy.nextStatus(
                        CANCEL, "PENDING",
                        "user-1", "user-2", "user-2"
                )
        );
    }

    @Test
    void shouldPreventChangingFinishedProposal() {
        assertThrows(
                TradeProposalConflictException.class,
                () -> policy.nextStatus(
                        ACCEPT, "REJECTED",
                        "user-1", "user-2", "user-2"
                )
        );
    }
}
