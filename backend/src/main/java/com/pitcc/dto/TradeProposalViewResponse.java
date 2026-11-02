package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.TradeProposalEventType;
import com.pitcc.model.TradeProposalStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Visao de leitura da proposta. Apenas dados relativos a negociacao e
 * campos publicos dos participantes sao retornados; nunca User ou a
 * entidade TradeProposal diretamente (requestKey, version etc.).
 */
public record TradeProposalViewResponse(
        String id,
        String adId,
        TradeProposalDirection direction,
        TradeProposalStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant acceptedAt,
        Instant rejectedAt,
        Instant cancelledAt,
        Instant completedAt,
        Participant proposer,
        Participant recipient,
        List<Item> offeredItems,
        List<Item> requestedItems,
        FinancialAdjustmentView financialAdjustment,
        List<Event> events
) {
    public record Participant(String id, String username, String name) {}

    /** A carta vem do snapshot historico da proposta, nao do catalogo atual. */
    public record Item(
            String cardId,
            String name,
            CardGame game,
            String edition,
            String cardNumber,
            String imageUrl,
            CardCondition condition,
            CardLanguage language,
            int quantity
    ) {}

    /** Pagador expresso pelo papel, sem expor informacoes privadas. */
    public record FinancialAdjustmentView(
            BigDecimal amount,
            String currency,
            TradeFinancialAdjustmentPayer payer
    ) {}

    public record Event(
            TradeProposalEventType eventType,
            TradeProposalStatus fromStatus,
            TradeProposalStatus toStatus,
            TradeFinancialAdjustmentPayer actor,
            Instant occurredAt
    ) {}
}
