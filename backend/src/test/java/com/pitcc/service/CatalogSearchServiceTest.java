package com.pitcc.service;

import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.model.*;
import com.pitcc.repository.CardRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogSearchServiceTest {
  @Mock CardRepository repository;
  CatalogSearchService service;

  @BeforeEach void setUp() { service = new CatalogSearchService(repository); }

  @Test void shouldSearchOnlyTheInternalCatalog() {
    Card card = new PokemonCard("Pikachu", "Base", "base1", "25", "Common", null,
        "base1-25", 60, PokemonCardType.POKEMON, List.of(PokemonEnergyType.LIGHTNING), null, 1, List.of());
    when(repository.findTop50ByGameAndNameContainingIgnoreCaseOrderByNameAscIdAsc(CardGame.POKEMON, "Pikachu"))
        .thenReturn(List.of(card));
    var result = service.search("POKEMON", " Pikachu ");
    assertEquals("base1-25", result.getFirst().externalId());
    assertEquals("Base", result.getFirst().setName());
    verify(repository).findTop50ByGameAndNameContainingIgnoreCaseOrderByNameAscIdAsc(CardGame.POKEMON, "Pikachu");
    verifyNoMoreInteractions(repository);
  }

  @Test void shouldReturnEmptyWithoutFallingBackToExternalApis() {
    when(repository.findTop50ByGameAndNameContainingIgnoreCaseOrderByNameAscIdAsc(CardGame.MAGIC_THE_GATHERING, "missing"))
        .thenReturn(List.of());
    assertTrue(service.search("mtg", "missing").isEmpty());
  }

  @Test void shouldUseSourceAsWellAsExternalId() {
    when(repository.findBySourceAndExternalId(CardSource.YGOPRODECK, "missing")).thenReturn(Optional.empty());
    assertThrows(CatalogCardNotFoundException.class, () -> service.findByExternalId("yugioh", " missing "));
    verify(repository).findBySourceAndExternalId(CardSource.YGOPRODECK, "missing");
  }

  @Test void shouldRejectInvalidRequestsBeforeQueryingTheDatabase() {
    assertThrows(InvalidCatalogRequestException.class, () -> service.search("digimon", "x"));
    assertThrows(InvalidCatalogRequestException.class, () -> service.search("pokemon", " "));
    assertThrows(InvalidCatalogRequestException.class, () -> service.findByExternalId("pokemon", " "));
    verifyNoInteractions(repository);
  }
}
