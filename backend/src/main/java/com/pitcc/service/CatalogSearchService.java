package com.pitcc.service;

import com.pitcc.dto.CatalogCardResponse;
import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CardGame;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CatalogSearchService {

  private static final Logger log = LoggerFactory.getLogger(CatalogSearchService.class);

  private final Map<CardGame, CardCatalogProvider> providers;

  public CatalogSearchService(List<CardCatalogProvider> providers) {
    this.providers = providers.stream()
        .collect(Collectors.toUnmodifiableMap(provider -> provider.getCardGame(), Function.identity()));
  }

  public List<CatalogCardResponse> search(String game, String query) {
    if (query == null || query.isBlank()) {
      throw new InvalidCatalogRequestException("Informe o nome da carta no parâmetro q.");
    }
    CardCatalogProvider provider = provider(game);
    String term = query.trim();
    List<CatalogCardResponse> cards = provider.searchCards(term).stream()
        .map(CatalogCardResponse::from)
        .toList();
    log.info("Busca no catálogo {} por \"{}\" devolveu {} carta(s)", provider.getCardGame(), term, cards.size());
    return cards;
  }

  public CatalogCardResponse findByExternalId(String game, String externalId) {
    if (externalId == null || externalId.isBlank()) {
      throw new InvalidCatalogRequestException("Informe o externalId.");
    }
    CardCatalogProvider provider = provider(game);
    String id = externalId.trim();
    return provider.findByExternalId(id)
        .map(CatalogCardResponse::from)
        .orElseThrow(CatalogCardNotFoundException::new);
  }

  private CardCatalogProvider provider(String game) {
    if (game == null || game.isBlank()) {
      throw unknownGame(game);
    }
    CardGame cardGame = switch (game.trim().toLowerCase(Locale.ROOT)) {
      case "pokemon" -> CardGame.POKEMON;
      case "yugioh" -> CardGame.YUGIOH;
      case "magic", "mtg" -> CardGame.MAGIC_THE_GATHERING;
      default -> throw unknownGame(game);
    };
    CardCatalogProvider provider = providers.get(cardGame);
    if (provider == null) {
      throw new IllegalStateException("Nenhum provedor registrado para " + cardGame);
    }
    return provider;
  }

  private static InvalidCatalogRequestException unknownGame(String game) {
    String informed = game == null || game.isBlank() ? "" : game.trim();
    String suffix = informed.isEmpty() ? "" : ": " + informed;
    return new InvalidCatalogRequestException(
        "Jogo desconhecido" + suffix + ". Use pokemon, yugioh ou magic.");
  }
}
