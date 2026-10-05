package com.pitcc.integration.catalog.pokemon;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonImagesDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PokemonTcgProviderTest {

  @Mock
  private PokemonTcgClient client;

  @InjectMocks
  private PokemonTcgProvider provider;

  @Test
  void shouldAdaptSearchResultsAndSkipIncompleteCards() {
    when(client.search("charizard")).thenReturn(List.of(
        new PokemonCardDto(
            "base1-4",
            "Charizard",
            "4",
            "Rare Holo",
            new PokemonSetDto("base1", "Base"),
            new PokemonImagesDto(null, "https://img.example/l.png")),
        new PokemonCardDto(null, "Sem id", null, null, null, null),
        new PokemonCardDto("base4-4", "Charizard", "4", "Rare Holo", new PokemonSetDto("base4", "Base Set 2"), null)));

    List<ExternalCard> cards = provider.searchCards("charizard");

    assertEquals(List.of("base1-4", "base4-4"), cards.stream().map(card -> card.externalId()).toList());
    assertEquals(CardGame.POKEMON, cards.getFirst().cardGame());
    assertEquals(null, cards.getFirst().conceptualId());
    assertEquals("https://img.example/l.png", cards.getFirst().imageUrl());
  }

  @Test
  void shouldPropagateExternalFailures() {
    ExternalApiException failure = new ExternalApiException(
        CardGame.POKEMON, ExternalApiErrorType.RATE_LIMITED, 429, "limited", null);
    when(client.search("pikachu")).thenThrow(failure);

    ExternalApiException thrown = assertThrows(ExternalApiException.class, () -> provider.searchCards("pikachu"));

    assertSame(failure, thrown);
  }

  @Test
  void shouldReturnEmptyWhenCardDoesNotExist() {
    when(client.findById("missing")).thenReturn(Optional.empty());

    assertTrue(provider.findByExternalId("missing").isEmpty());
  }
}
