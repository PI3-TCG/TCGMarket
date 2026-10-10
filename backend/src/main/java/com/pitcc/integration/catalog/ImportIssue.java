package com.pitcc.integration.catalog;

import com.pitcc.model.CardSource;

/** externalId pode ser o identificador do DTO, antes de expandir suas impressões. */
public record ImportIssue(CardSource source, String externalId, String stage, String message) {}
