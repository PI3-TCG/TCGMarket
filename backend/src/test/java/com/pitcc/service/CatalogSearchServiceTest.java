package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pitcc.dto.CatalogCardResponse;
import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatalogSearchServiceTest {

  @Mock private CardCatalogProvider pokemon;
  @Mock private CardCatalogProvider yugioh;
  @Mock private CardCatalogProvider magic;

  private CatalogSearchService service;

  @BeforeEach
  void setUp() {
    when(pokemon.getCardGame()).thenReturn(CardGame.POKEMON);
    when(yugioh.getCardGame()).thenReturn(CardGame.YUGIOH);
    when(magic.getCardGame()).thenReturn(CardGame.MAGIC_THE_GATHERING);
    service = new CatalogSearchService(List.of(pokemon, yugioh, magic));
  }

  @Test
  void shouldSearchTheProviderForTheRequestedGame() {
    when(magic.searchCards("black lotus")).thenReturn(List.of(lotus()));

    List<CatalogCardResponse> cards = service.search("magic", " black lotus ");

    assertEquals(1, cards.size());
    assertEquals("alpha", cards.getFirst().externalId());
    assertEquals("Black Lotus", cards.getFirst().name());
    assertEquals(CardGame.MAGIC_THE_GATHERING, cards.getFirst().cardGame());
    verify(magic).searchCards("black lotus");
  }

  @Test
  void shouldAcceptGameAliases() {
    when(pokemon.searchCards("pikachu")).thenReturn(List.of());
    when(yugioh.searchCards("mago")).thenReturn(List.of());
    when(magic.searchCards("island")).thenReturn(List.of());

    assertEquals(List.of(), service.search("POKEMON", "pikachu"));
    assertEquals(List.of(), service.search("yugioh", "mago"));
    assertEquals(List.of(), service.search("mtg", "island"));
  }

  @Test
  void shouldRejectUnknownGameAndBlankQuery() {
    InvalidCatalogRequestException unknown = assertThrows(
        InvalidCatalogRequestException.class, () -> service.search("digimon", "x"));
    assertEquals("Jogo desconhecido: digimon. Use pokemon, yugioh ou magic.", unknown.getMessage());

    InvalidCatalogRequestException blank = assertThrows(
        InvalidCatalogRequestException.class, () -> service.search("pokemon", " "));
    assertEquals("Informe o nome da carta no parâmetro q.", blank.getMessage());
  }

  @Test
  void shouldFindACardByExternalId() {
    when(pokemon.findByExternalId("base1-4")).thenReturn(Optional.of(charizard()));

    CatalogCardResponse card = service.findByExternalId("pokemon", " base1-4 ");

    assertEquals("base1-4", card.externalId());
    assertEquals("Charizard", card.name());
  }

  @Test
  void shouldReportWhenTheExternalIdDoesNotExist() {
    when(yugioh.findByExternalId("missing")).thenReturn(Optional.empty());

    assertThrows(CatalogCardNotFoundException.class, () -> service.findByExternalId("yugioh", "missing"));
  }

  private static ExternalCard lotus() {
    return new ExternalCard(
        "alpha",
        "oracle-lotus",
        "Black Lotus",
        CardGame.MAGIC_THE_GATHERING,
        "Limited Edition Alpha",
        "lea",
        "232",
        "rare",
        "https://img.example/lotus.jpg");
  }

  private static ExternalCard charizard() {
    return new ExternalCard(
        "base1-4", null, "Charizard", CardGame.POKEMON, "Base", "base1", "4", "Rare Holo", null);
  }
}
