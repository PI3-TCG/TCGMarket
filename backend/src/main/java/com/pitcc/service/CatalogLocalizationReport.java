package com.pitcc.service;

import com.pitcc.model.CardSource;

/**
 * {@code fetched}: cartas traduzidas recebidas da fonte; {@code matched}: as que
 * encontraram uma carta do catálogo; {@code modified}: documentos alterados no MongoDB.
 */
public record CatalogLocalizationReport(
        CardSource source,
        String language,
        int fetched,
        int matched,
        int modified,
        int unmatched) {}
