package com.pitcc.service;

import com.pitcc.integration.catalog.*;
import com.pitcc.model.*;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogImportServiceTest {
  @Mock CatalogImportProvider provider;
  @Mock CardImportService persistence;
  CatalogImportService service;

  @BeforeEach void setUp() {
    when(provider.getCardGame()).thenReturn(CardGame.POKEMON);
    when(provider.getSource()).thenReturn(CardSource.POKEMON_TCG_API);
    service = new CatalogImportService(List.of(provider), persistence);
  }

  @Test void shouldReportAnExternalFailureWithoutWriting() {
    when(provider.fetchForImport("Pikachu")).thenThrow(new ExternalApiException(
        CardGame.POKEMON, ExternalApiErrorType.TIMEOUT, null, "timeout", null));
    var report = service.importByQuery("pokemon", "Pikachu");
    assertTrue(report.aborted());
    assertFalse(report.successful());
    assertEquals("FETCH", report.issues().getFirst().stage());
    assertEquals(0, report.persisted());
    verifyNoInteractions(persistence);
  }

  @Test void shouldStopAndReportPartialProgressOnDatabaseFailure() {
    Card a = card("a"), b = card("b"), c = card("c");
    when(provider.fetchForImport("Pikachu")).thenReturn(new ImportBatch(List.of(a,b,c), List.of()));
    when(persistence.upsert(a)).thenReturn(a);
    when(persistence.upsert(b)).thenThrow(new DataAccessResourceFailureException("offline"));
    var report = service.importByQuery("pokemon", "Pikachu");
    assertTrue(report.aborted());
    assertEquals(1, report.persisted());
    assertEquals(1, report.notAttempted());
    assertEquals("b", report.issues().getFirst().externalId());
    assertEquals("PERSISTENCE", report.issues().getFirst().stage());
    verify(persistence, never()).upsert(c);
  }

  @Test void shouldKeepMappingFailuresVisibleWhileSavingValidCards() {
    Card card = card("valid");
    var issue = new ImportIssue(CardSource.POKEMON_TCG_API, "invalid", "MAPPING", "HP inválido");
    when(provider.fetchForImport("Pikachu")).thenReturn(new ImportBatch(List.of(card), List.of(issue)));
    when(persistence.upsert(card)).thenReturn(card);
    var report = service.importByQuery("pokemon", "Pikachu");
    assertFalse(report.successful());
    assertFalse(report.aborted());
    assertEquals(1, report.persisted());
    assertEquals(List.of(issue), report.issues());
  }

  private Card card(String id) {
    return new PokemonCard("Pikachu", "Base", "base1", "25", "Common", null,
        id, 60, PokemonCardType.POKEMON, List.of(PokemonEnergyType.LIGHTNING), null, 1, List.of());
  }
}
