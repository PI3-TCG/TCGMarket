package com.pitcc.exception;

import org.springframework.http.HttpStatus;

/** Erro de dominio especifico do envio de proposta. */
public final class TradeProposalCreationException extends RuntimeException {
    private final HttpStatus status;
    private final String field;

    private TradeProposalCreationException(HttpStatus status, String field, String message) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public static TradeProposalCreationException invalid(String field, String message) {
        return new TradeProposalCreationException(HttpStatus.BAD_REQUEST, field, message);
    }

    public static TradeProposalCreationException missing(String field, String message) {
        return new TradeProposalCreationException(HttpStatus.NOT_FOUND, field, message);
    }

    public static TradeProposalCreationException conflict(String field, String message) {
        return new TradeProposalCreationException(HttpStatus.CONFLICT, field, message);
    }

    public HttpStatus getStatus() { return status; }
    public String getField() { return field; }
}
