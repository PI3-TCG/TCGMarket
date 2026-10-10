package com.pitcc.service;

import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardSource;
import java.util.Locale;

public final class CatalogGameResolver {
  private CatalogGameResolver() {}

  public static CardGame parse(String game) {
    String value = game == null ? "" : game.trim();
    return switch (value.toLowerCase(Locale.ROOT)) {
      case "pokemon" -> CardGame.POKEMON;
      case "yugioh" -> CardGame.YUGIOH;
      case "magic", "mtg" -> CardGame.MAGIC_THE_GATHERING;
      default -> throw new InvalidCatalogRequestException("Jogo desconhecido"
          + (value.isEmpty() ? "" : ": " + value) + ". Use pokemon, yugioh ou magic.");
    };
  }

  public static CardSource source(CardGame game) {
    return switch (game) {
      case POKEMON -> CardSource.POKEMON_TCG_API;
      case YUGIOH -> CardSource.YGOPRODECK;
      case MAGIC_THE_GATHERING -> CardSource.SCRYFALL;
    };
  }
}
