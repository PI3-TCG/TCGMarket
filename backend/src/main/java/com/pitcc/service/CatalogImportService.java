package com.pitcc.service;

import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.integration.catalog.*;
import com.pitcc.model.Card;
import com.pitcc.model.CardGame;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class CatalogImportService {
  private static final Logger log = LoggerFactory.getLogger(CatalogImportService.class);
  private final Map<CardGame, CatalogImportProvider> providers;
  private final CardImportService persistence;

  public CatalogImportService(List<CatalogImportProvider> providers, CardImportService persistence) {
    this.providers = providers.stream().collect(Collectors.toUnmodifiableMap(
        CatalogImportProvider::getCardGame, Function.identity()));
    this.persistence = persistence;
  }

  /** Importa os resultados da busca fornecidos pelo adapter; não é um crawler completo. */
  public CatalogImportReport importByQuery(String game, String query) {
    CardGame selected = CatalogGameResolver.parse(game);
    if (query == null || query.isBlank()) {
      throw new InvalidCatalogRequestException("Informe um termo para importar.");
    }
    CatalogImportProvider provider = providers.get(selected);
    if (provider == null) throw new IllegalStateException("Provedor não registrado: " + selected);
    ImportBatch batch;
    try {
      batch = provider.fetchForImport(query.trim());
    } catch (ExternalApiException exception) {
      log.error("Importação abortada ao consultar {}", provider.getSource(), exception);
      return new CatalogImportReport(provider.getSource(), 0, 0, 0, true,
          List.of(new ImportIssue(provider.getSource(), null, "FETCH",
              exception.getErrorType() + ": " + exception.getMessage())));
    }
    List<ImportIssue> issues = new ArrayList<>(batch.issues());
    int persisted = 0;
    for (int i = 0; i < batch.cards().size(); i++) {
      Card card = batch.cards().get(i);
      try {
        if (card.getSource() != provider.getSource() || card.getGame() != selected) {
          throw new IllegalArgumentException("Origem ou jogo incompatível com o adapter.");
        }
        persistence.upsert(card);
        persisted++;
      } catch (IllegalArgumentException exception) {
        issues.add(new ImportIssue(provider.getSource(), card.getExternalId(), "VALIDATION", exception.getMessage()));
        log.warn("Carta rejeitada: source={}, externalId={}", provider.getSource(), card.getExternalId(), exception);
      } catch (DataAccessException exception) {
        // Em falha de rede, o resultado da última escrita pode ser desconhecido.
        // Não revertemos cartas válidas: a reexecução do lote é idempotente.
        issues.add(new ImportIssue(provider.getSource(), card.getExternalId(), "PERSISTENCE",
            "Falha de persistência; confira a causa no log e reexecute o lote. Resultado da última escrita pode ser desconhecido."));
        log.error("Importação interrompida: source={}, externalId={}", provider.getSource(), card.getExternalId(), exception);
        return new CatalogImportReport(provider.getSource(), batch.cards().size(), persisted,
            batch.cards().size() - i - 1, true, issues);
      }
    }
    return new CatalogImportReport(provider.getSource(), batch.cards().size(), persisted, 0, false, issues);
  }
}
