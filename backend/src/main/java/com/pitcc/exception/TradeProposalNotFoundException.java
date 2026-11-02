package com.pitcc.exception;

/** Mesmo erro para ID inexistente e proposta de terceiros. */
public class TradeProposalNotFoundException extends RuntimeException {
    public TradeProposalNotFoundException() {
        super("Proposta não encontrada.");
    }
}
