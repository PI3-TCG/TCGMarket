package com.pitcc.dto;

import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;

import java.time.Instant;
import java.util.List;

/** Resposta de confirmacao do envio; nao oferece listagem ou gerenciamento. */
public record TradeProposalResponse(
        String id,
        String proposerId,
        String recipientId,
        String adId,
        TradeProposalStatus status,
        Instant createdAt,
        List<TradeProposalItem> offeredItems,
        List<TradeProposalItem> requestedItems,
        FinancialAdjustment financialAdjustment
) {
    public static TradeProposalResponse from(TradeProposal proposal) {
        return new TradeProposalResponse(
                proposal.getId(),
                proposal.getProposerId(),
                proposal.getRecipientId(),
                proposal.getAdId(),
                proposal.getStatus(),
                proposal.getCreatedAt(),
                proposal.getOfferedItems(),
                proposal.getRequestedItems(),
                proposal.getFinancialAdjustment());
    }
}
