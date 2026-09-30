package com.pitcc.integration.catalog.yugioh;

import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class YugiohProvider implements CardCatalogProvider {

  static final int SEARCH_LIMIT = 20;

  private final YugiohClient client;

  public YugiohProvider(YugiohClient client) {
    this.client = client;
  }

  @Override
  public CardGame getCardGame() {
    return CardGame.YUGIOH;
  }

  @Override
  public List<ExternalCard> searchCards(String query) {
    return client.search(query).stream()
        .flatMap(dto -> YugiohCardMapper.toExternalCards(dto).stream())
        .limit(SEARCH_LIMIT)
        .toList();
  }

  /** Um id fora do formato de {@link YugiohPrintingId} não existe no catálogo e retorna vazio. */
  @Override
  public Optional<ExternalCard> findByExternalId(String externalId) {
    Assert.hasText(externalId, "externalId must not be blank");
    Optional<YugiohPrintingId> printingId = YugiohPrintingId.parse(externalId);
    if (printingId.isEmpty()) {
      return Optional.empty();
    }
    String wanted = printingId.get().value();
    return client.findByPasscode(printingId.get().passcode()).stream()
        .flatMap(dto -> YugiohCardMapper.toExternalCards(dto).stream())
        .filter(card -> card.externalId().equals(wanted))
        .findFirst();
  }
}
