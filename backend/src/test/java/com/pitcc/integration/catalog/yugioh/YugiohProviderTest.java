package com.pitcc.integration.catalog.yugioh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardImageDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardSetDto;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class YugiohProviderTest {

  private static final YugiohCardDto BLUE_EYES = new YugiohCardDto(
      89631139L,
      "Blue-Eyes White Dragon",
      List.of(
          new YugiohCardSetDto("Legend of Blue Eyes White Dragon", "LOB-EN001", "Ultra Rare"),
          new YugiohCardSetDto("Starter Deck: Kaiba", "SDK-001", "Ultra Rare"),
          new YugiohCardSetDto("Legendary Collection", "LC01-EN004", "Ultra Rare")),
      List.of(new YugiohCardImageDto("https://img.example/bewd.jpg", null)));

  @Mock
  private YugiohClient client;

  @InjectMocks
  private YugiohProvider provider;

  @Test
  void shouldReturnEveryPrintingOfASearchResult() {
    when(client.search("blue-eyes")).thenReturn(List.of(BLUE_EYES, new YugiohCardDto(null, "Sem id", null, null)));

    List<ExternalCard> cards = provider.searchCards("blue-eyes");

    assertEquals(
        List.of("89631139:LOB-EN001:Ultra Rare", "89631139:SDK-001:Ultra Rare", "89631139:LC01-EN004:Ultra Rare"),
        cards.stream().map(card -> card.externalId()).toList());
    assertTrue(cards.stream().allMatch(card -> card.cardGame() == CardGame.YUGIOH));
  }

  @Test
  void shouldLimitSearchAfterExpandingPrintings() {
    List<YugiohCardSetDto> sets = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      sets.add(new YugiohCardSetDto("Set " + index, "SET-" + index, "Common"));
    }
    when(client.search("many")).thenReturn(List.of(new YugiohCardDto(1L, "Many", sets, null)));

    List<ExternalCard> cards = provider.searchCards("many");

    assertEquals(YugiohProvider.SEARCH_LIMIT, cards.size());
    assertEquals("1:SET-0:Common", cards.getFirst().externalId());
    assertEquals("1:SET-19:Common", cards.getLast().externalId());
  }

  @Test
  void shouldFindTheRequestedPrintingInsteadOfTheFirstOne() {
    when(client.findByPasscode(89631139L)).thenReturn(Optional.of(BLUE_EYES));

    ExternalCard card = provider.findByExternalId("89631139:LC01-EN004:Ultra Rare").orElseThrow();

    assertEquals("89631139:LC01-EN004:Ultra Rare", card.externalId());
    assertEquals("89631139", card.conceptualId());
    assertEquals("Legendary Collection", card.setName());
    assertEquals("LC01-EN004", card.setCode());
  }

  @Test
  void shouldReturnEmptyWhenPrintingIsNotInTheCard() {
    when(client.findByPasscode(89631139L)).thenReturn(Optional.of(BLUE_EYES));

    assertTrue(provider.findByExternalId("89631139:NOPE-000:Ultra Rare").isEmpty());
    assertTrue(provider.findByExternalId("89631139:LOB-EN001:Common").isEmpty());
  }

  @Test
  void shouldReturnEmptyForMalformedIdWithoutCallingTheApi() {
    assertTrue(provider.findByExternalId("89631139").isEmpty());
    assertTrue(provider.findByExternalId("not-a-passcode:LOB-EN001").isEmpty());
    verify(client, never()).findByPasscode(anyLong());
  }

  @Test
  void shouldRejectBlankId() {
    assertThrows(IllegalArgumentException.class, () -> provider.findByExternalId(" "));
  }

  @Test
  void shouldReturnEmptyWhenCardDoesNotExist() {
    when(client.findByPasscode(1L)).thenReturn(Optional.empty());

    assertTrue(provider.findByExternalId("1:SET-001").isEmpty());
  }

  @Test
  void shouldPropagateExternalFailures() {
    ExternalApiException failure = new ExternalApiException(
        CardGame.YUGIOH, ExternalApiErrorType.SERVER_ERROR, 503, "down", null);
    when(client.findByPasscode(1L)).thenThrow(failure);

    ExternalApiException thrown = assertThrows(ExternalApiException.class, () -> provider.findByExternalId("1:SET-001"));

    assertSame(failure, thrown);
  }
}
