package com.pitcc.model;

/** Estados do ciclo de vida; apenas PENDING e usado nesta etapa. */
public enum TradeProposalStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    CANCELLED,
    COMPLETED
}
