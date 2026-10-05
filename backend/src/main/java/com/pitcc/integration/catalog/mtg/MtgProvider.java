package com.pitcc.integration.catalog.mtg;

import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MtgProvider implements CardCatalogProvider {

  static final int SEARCH_LIMIT = 20;

  private static final Logger log = LoggerFactory.getLogger(MtgProvider.class);

  private final MtgClient client;

  public MtgProvider(MtgClient client) {
    this.client = client;
  }

  @Override
  public CardGame getCardGame() {
    return CardGame.MAGIC_THE_GATHERING;
  }

  @Override
  public List<ExternalCard> searchCards(String query) {
    return client.search(query).stream()
        .map(this::toCard)
        .flatMap(card -> card.stream())
        .limit(SEARCH_LIMIT)
        .toList();
  }

  @Override
  public Optional<ExternalCard> findByExternalId(String externalId) {
    return client.findById(externalId).flatMap(this::toCard);
  }

  private Optional<ExternalCard> toCard(MtgCardDto dto) {
    Optional<ExternalCard> card = MtgCardMapper.toExternalCard(dto);
    if (card.isEmpty()) {
      log.warn("Ignorando carta do catálogo Magic sem id ou nome");
    }
    return card;
  }
}
