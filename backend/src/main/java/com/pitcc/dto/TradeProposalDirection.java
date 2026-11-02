package com.pitcc.dto;

import java.util.Locale;

/** A direcao da consulta e relativa a quem esta autenticado. */
public enum TradeProposalDirection {
    SENT,
    RECEIVED;

    public static TradeProposalDirection fromQuery(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Informe direction=sent ou direction=received.");
        }
        return switch (value.strip().toLowerCase(Locale.ROOT)) {
            case "sent" -> SENT;
            case "received" -> RECEIVED;
            default -> throw new IllegalArgumentException("Direcao invalida. Use sent ou received.");
        };
    }
}
