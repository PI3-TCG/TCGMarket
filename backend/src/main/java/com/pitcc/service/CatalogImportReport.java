package com.pitcc.service;

import com.pitcc.integration.catalog.ImportIssue;
import com.pitcc.model.CardSource;
import java.util.List;

public record CatalogImportReport(CardSource source, int mapped, int persisted,
    int notAttempted, boolean aborted, List<ImportIssue> issues) {
  public CatalogImportReport { issues = List.copyOf(issues); }
  public boolean successful() { return !aborted && issues.isEmpty(); }
}
