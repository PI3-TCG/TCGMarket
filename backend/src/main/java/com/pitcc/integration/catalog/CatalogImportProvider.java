package com.pitcc.integration.catalog;

import com.pitcc.model.CardGame;
import com.pitcc.model.CardSource;

/** Busca explícita para importação. Não é usada na navegação do catálogo. */
public interface CatalogImportProvider {
  CardGame getCardGame();
  CardSource getSource();
  ImportBatch fetchForImport(String query);
}
