package com.pitcc.model;

import java.time.Instant;

/** Evento historico de uma proposta; no escopo atual registra somente CREATED. */
public class TradeProposalEvent {

    private TradeProposalEventType eventType;
    private TradeProposalStatus fromStatus;
    private TradeProposalStatus toStatus;
    private String actorId;
    private Instant occurredAt;
    private String reasonCode;

    protected TradeProposalEvent() {
    }

    public TradeProposalEvent(TradeProposalEventType eventType,
                              TradeProposalStatus fromStatus,
                              TradeProposalStatus toStatus,
                              String actorId, Instant occurredAt,
                              String reasonCode) {
        if (eventType == null || toStatus == null || actorId == null || actorId.isBlank()
                || occurredAt == null) {
            throw new IllegalArgumentException("O evento deve indicar tipo, status, autor e data.");
        }
        this.eventType = eventType;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.occurredAt = occurredAt;
        this.reasonCode = reasonCode;
    }

    public TradeProposalEventType getEventType() { return eventType; }
    public TradeProposalStatus getFromStatus() { return fromStatus; }
    public TradeProposalStatus getToStatus() { return toStatus; }
    public String getActorId() { return actorId; }
    public Instant getOccurredAt() { return occurredAt; }
    public String getReasonCode() { return reasonCode; }
}
