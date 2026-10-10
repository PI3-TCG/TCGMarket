package com.pitcc.integration.catalog;

import com.pitcc.model.Card;
import com.pitcc.model.CardSource;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public record ImportBatch(List<Card> cards, List<ImportIssue> issues) {
  private static final Logger log = LoggerFactory.getLogger(ImportBatch.class);

  public ImportBatch {
    cards = List.copyOf(cards);
    issues = List.copyOf(issues);
  }

  /** Um DTO inválido é relatado; os demais continuam sendo mapeados. */
  public static <D> ImportBatch map(List<D> rows, CardSource source,
      Function<D, String> identify, Function<D, ? extends List<? extends Card>> mapper) {
    List<Card> cards = new ArrayList<>();
    List<ImportIssue> issues = new ArrayList<>();
    for (D row : rows) {
      String id = null;
      try {
        id = row == null ? null : identify.apply(row);
        List<? extends Card> mapped = mapper.apply(row);
        if (mapped.isEmpty()) {
          throw new IllegalArgumentException("Registro sem identificação, nome ou impressão utilizável.");
        }
        // Valida o resultado inteiro antes de adicioná-lo ao lote.
        cards.addAll(List.copyOf(mapped));
      } catch (RuntimeException exception) {
        issues.add(new ImportIssue(source, id, "MAPPING", exception.getMessage()));
        log.warn("Falha de mapeamento: source={}, externalId={}", source, id, exception);
      }
    }
    return new ImportBatch(cards, issues);
  }
}
