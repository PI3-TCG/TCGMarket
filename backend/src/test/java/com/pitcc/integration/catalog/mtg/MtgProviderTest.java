package com.pitcc.integration.catalog.mtg;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MtgProviderTest {

  @Mock
  private MtgClient client;

  @InjectMocks
  private MtgProvider provider;

  @Test
  void shouldKeepEveryPrintingAndSkipIncompleteCards() {
    when(client.search("lotus")).thenReturn(List.of(
        new MtgCardDto(" ", "oracle-lotus", "Sem id", null, null, null, null, null, null),
        new MtgCardDto("alpha", "oracle-lotus", "Black Lotus", "lea", "Limited Edition Alpha", "232", "rare",
            new MtgImageUris(null, "https://img.example/alpha.jpg"), null),
        new MtgCardDto("beta", "oracle-lotus", "Black Lotus", "leb", "Limited Edition Beta", "233", "rare",
            null, null)));

    List<ExternalCard> cards = provider.searchCards("lotus");

    assertEquals(List.of("alpha", "beta"), cards.stream().map(ExternalCard::externalId).toList());
    assertTrue(cards.stream().allMatch(card -> "oracle-lotus".equals(card.conceptualId())));
    assertEquals(CardGame.MAGIC_THE_GATHERING, cards.getFirst().cardGame());
    assertEquals("233", cards.getLast().cardNumber());
  }

  @Test
  void shouldLimitAfterMappingPrintings() {
    List<MtgCardDto> printings = new ArrayList<>();
    printings.add(new MtgCardDto(null, "oracle-island", "Sem id", null, null, null, null, null, null));
    for (int index = 0; index < 25; index++) {
      printings.add(new MtgCardDto(
          "island-" + index, "oracle-island", "Island", "set" + index, null, null, "common", null, null));
    }
    when(client.search("island")).thenReturn(printings);

    List<ExternalCard> cards = provider.searchCards("island");

    assertEquals(MtgProvider.SEARCH_LIMIT, cards.size());
    assertEquals("island-0", cards.getFirst().externalId());
    assertEquals("island-19", cards.getLast().externalId());
    assertEquals(MtgProvider.SEARCH_LIMIT, cards.stream().map(ExternalCard::externalId).distinct().count());
  }

  @Test
  void shouldPropagateExternalFailures() {
    ExternalApiException failure = new ExternalApiException(
        CardGame.MAGIC_THE_GATHERING, ExternalApiErrorType.UNAVAILABLE, null, "down", null);
    when(client.search("lotus")).thenThrow(failure);

    ExternalApiException thrown = assertThrows(ExternalApiException.class, () -> provider.searchCards("lotus"));

    assertSame(failure, thrown);
  }

  @Test
  void shouldReturnEmptyWhenCardDoesNotExist() {
    when(client.findById("missing")).thenReturn(Optional.empty());

    assertTrue(provider.findByExternalId("missing").isEmpty());
  }
}
