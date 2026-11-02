package com.pitcc.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Proposta pendente de troca: armazena os termos e snapshots do envio.
 * Enviar NAO reserva nem transfere cartas. Outros status serao usados em tarefas futuras.
 */
@Document(collection = "trade_proposals")
@CompoundIndexes({
        @CompoundIndex(name = "trade_proposals_sent", def = "{'proposerId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "trade_proposals_received", def = "{'recipientId': 1, 'status': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "trade_proposals_ad_status", def = "{'adId': 1, 'status': 1}"),
        @CompoundIndex(
                name = "uk_trade_proposals_request_key",
                def = "{'proposerId': 1, 'requestKey': 1}",
                unique = true,
                partialFilter = "{'requestKey': {'$type': 'string'}}"
        )
})
public class TradeProposal {

    @Id
    private String id;

    private String proposerId;
    private String recipientId;
    private String adId;
    private TargetAdSnapshot targetAdSnapshot;
    private List<TradeProposalItem> offeredItems;
    private List<TradeProposalItem> requestedItems;
    private FinancialAdjustment financialAdjustment;
    private TradeProposalStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant acceptedAt;
    private Instant rejectedAt;
    private Instant cancelledAt;
    private Instant completedAt;
    private List<TradeProposalEvent> events;
    private String transactionId;

    @Version
    private Long version;

    private String requestKey;

    protected TradeProposal() {
    }

    /**
     * Construcao a partir de dados confiaveis consultados pelo service.
     * Autenticacao, posse e elegibilidade do anuncio sao verificadas no service.
     */
    public static TradeProposal create(String proposerId,
                                       String recipientId,
                                       String adId,
                                       TargetAdSnapshot targetAdSnapshot,
                                       List<TradeProposalItem> offeredItems,
                                       List<TradeProposalItem> requestedItems,
                                       FinancialAdjustment financialAdjustment,
                                       String requestKey,
                                       Instant now) {
        if (blank(proposerId) || blank(recipientId) || proposerId.equals(recipientId)) {
            throw new IllegalArgumentException("A proposta exige dois usuarios diferentes.");
        }
        if (blank(adId) || targetAdSnapshot == null
                || !recipientId.equals(targetAdSnapshot.getSellerId())
                || !targetAdSnapshot.isTradeEnabled()) {
            throw new IllegalArgumentException("O anuncio de origem deve pertencer ao destinatario e aceitar troca.");
        }
        if (now == null) {
            throw new IllegalArgumentException("Informe a data do envio.");
        }

        checkItems(offeredItems, "oferecidos");
        checkItems(requestedItems, "solicitados");

        for (TradeProposalItem item : offeredItems) {
            if (item.getSourceAdId() != null) {
                throw new IllegalArgumentException("Itens oferecidos nao devem apontar para o anuncio de origem.");
            }
        }

        long anchorCount = requestedItems.stream()
                .filter(item -> adId.equals(item.getSourceAdId())
                        && targetAdSnapshot.getCollectionItemId().equals(item.getCollectionItemId())
                        && targetAdSnapshot.getCardId().equals(item.getCardId()))
                .count();
        if (anchorCount != 1) {
            throw new IllegalArgumentException("Inclua a carta do anuncio entre os itens solicitados.");
        }
        if (requestedItems.stream().anyMatch(item -> item.getSourceAdId() != null
                && !adId.equals(item.getSourceAdId()))) {
            throw new IllegalArgumentException("O anuncio de origem informado e invalido.");
        }
        if (requestedItems.stream().anyMatch(item -> adId.equals(item.getSourceAdId())
                && !targetAdSnapshot.getCollectionItemId().equals(item.getCollectionItemId()))) {
            throw new IllegalArgumentException("A carta vinculada ao anuncio nao corresponde ao item solicitado.");
        }

        if (financialAdjustment != null) {
            Set<String> participants = Set.of(proposerId, recipientId);
            if (!participants.contains(financialAdjustment.getPayerId())
                    || !participants.contains(financialAdjustment.getPayeeId())) {
                throw new IllegalArgumentException("O complemento deve ocorrer entre os participantes da proposta.");
            }
        }

        TradeProposal proposal = new TradeProposal();
        proposal.id = UUID.randomUUID().toString();
        proposal.proposerId = proposerId;
        proposal.recipientId = recipientId;
        proposal.adId = adId;
        proposal.targetAdSnapshot = targetAdSnapshot;
        proposal.offeredItems = List.copyOf(offeredItems);
        proposal.requestedItems = List.copyOf(requestedItems);
        proposal.financialAdjustment = financialAdjustment;
        proposal.status = TradeProposalStatus.PENDING;
        proposal.createdAt = now;
        proposal.updatedAt = now;
        proposal.events = List.of(new TradeProposalEvent(
                TradeProposalEventType.CREATED, null,
                TradeProposalStatus.PENDING, proposerId, now, null));
        proposal.requestKey = blank(requestKey) ? null : requestKey.strip();
        return proposal;
    }

    private static void checkItems(List<TradeProposalItem> items, String side) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos uma carta entre os itens " + side + ".");
        }
        Set<String> ids = new HashSet<>();
        for (TradeProposalItem item : items) {
            if (item == null || !ids.add(item.getCollectionItemId())) {
                throw new IllegalArgumentException("Nao repita um item da colecao entre os " + side + ".");
            }
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("A quantidade deve ser positiva.");
            }
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public String getId() { return id; }
    public String getProposerId() { return proposerId; }
    public String getRecipientId() { return recipientId; }
    public String getAdId() { return adId; }
    public TargetAdSnapshot getTargetAdSnapshot() { return targetAdSnapshot; }
    public List<TradeProposalItem> getOfferedItems() { return List.copyOf(offeredItems); }
    public List<TradeProposalItem> getRequestedItems() { return List.copyOf(requestedItems); }
    public FinancialAdjustment getFinancialAdjustment() { return financialAdjustment; }
    public TradeProposalStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public Instant getRejectedAt() { return rejectedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public Instant getCompletedAt() { return completedAt; }
    public List<TradeProposalEvent> getEvents() { return List.copyOf(events); }
    public String getTransactionId() { return transactionId; }
    public Long getVersion() { return version; }
    public String getRequestKey() { return requestKey; }
}
