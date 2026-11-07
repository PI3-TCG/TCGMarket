
package com.pitcc.service;

import com.pitcc.exception.TradeProposalConflictException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class TradeProposalDecisionPolicy {

    public enum Action {
        ACCEPT,
        REJECT,
        CANCEL
    }

    public String nextStatus(
            Action action,
            String currentStatus,
            String proposerId,
            String recipientId,
            String authenticatedUserId
    ) {
        if (action == null) {
            throw new IllegalArgumentException(
                    "A ação é obrigatória."
            );
        }

        boolean isRecipient =
                authenticatedUserId != null
                        && authenticatedUserId.equals(recipientId);

        boolean isProposer =
                authenticatedUserId != null
                        && authenticatedUserId.equals(proposerId);

        // Permissões são verificadas antes de expor
        // informações sobre o estado da proposta.
        switch (action) {
            case ACCEPT, REJECT -> {
                if (!isRecipient) {
                    throw new AccessDeniedException(
                            "Apenas o destinatário pode responder à proposta."
                    );
                }
            }

            case CANCEL -> {
                if (!isProposer) {
                    throw new AccessDeniedException(
                            "Apenas o proponente pode cancelar a proposta."
                    );
                }
            }
        }

        if (!"PENDING".equals(currentStatus)) {
            throw new TradeProposalConflictException(
                    "A proposta não está mais pendente."
            );
        }

        return switch (action) {
            case ACCEPT -> "ACCEPTED";
            case REJECT -> "REJECTED";
            case CANCEL -> "CANCELLED";
        };
    }
}
