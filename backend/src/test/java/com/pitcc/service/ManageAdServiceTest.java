package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;
import com.pitcc.exception.AdNotActiveException;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.OwnAdRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ManageAdServiceTest {

  @Mock private AdRepository adRepository;
  @Mock private OwnAdRepository ownAdRepository;
  @Mock private CardRepository cardRepository;

  private ManageAdService service;
  private Card card;

  @BeforeEach
  void setUp() {
    service = new ManageAdService(adRepository, ownAdRepository, cardRepository);
    card =
        new YugiohCard(
            "Dark Magician", "Starter", "sdy", "006", "Ultra Rare", null, "46986414", null, null,
            null, null, null, null, null, YugiohCardType.TRAP, List.of());
    ReflectionTestUtils.setField(card, "id", "card-1");
  }

  private Ad ad(AdStatus status, int remaining) {
    CollectionItem item =
        new CollectionItem("u1", "card-1", 5, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-1");
    Ad ad = new Ad("u1", item, 3, true, true, new BigDecimal("45.00"), Instant.now());
    ReflectionTestUtils.setField(ad, "id", "ad-1");
    ReflectionTestUtils.setField(ad, "status", status);
    ReflectionTestUtils.setField(ad, "remainingQuantity", remaining);
    return ad;
  }

  @Test
  void shouldListOwnAdsWithCardData() {
    OwnAdFilters filters = new OwnAdFilters(" dark ", null, null, null);
    when(ownAdRepository.findOwnAds(eq("u1"), eq(filters), any()))
        .thenReturn(new PageImpl<>(List.of(ad(AdStatus.ACTIVE, 3)), PageRequest.of(0, 20), 1));
    when(cardRepository.findAllById(any())).thenReturn(List.of(card));

    var page = service.findOwnAds("u1", 0, 20, filters);

    assertEquals(1, page.getTotalElements());
    OwnAdResponse response = page.getContent().getFirst();
    assertEquals("Dark Magician", response.card().name());
    assertEquals(CardCondition.NEAR_MINT, response.condition());
    assertNull(response.releasedQuantity());
    assertEquals("dark", filters.search());
  }

  @Test
  void shouldRejectPageSizeAboveLimit() {
    assertThrows(
        IllegalArgumentException.class,
        () -> service.findOwnAds("u1", 0, 21, new OwnAdFilters(null, null, null, null)));
    verifyNoInteractions(ownAdRepository);
  }

  @Test
  void shouldReturnNotFoundForAdOfAnotherUser() {
    when(adRepository.findByIdAndSellerId("ad-1", "u1")).thenReturn(Optional.empty());

    assertThrows(AdNotFoundException.class, () -> service.findOwnAd("u1", "ad-1"));
  }

  @Test
  void shouldUpdateModalityAndPriceOfActiveAd() {
    Ad updated = ad(AdStatus.ACTIVE, 3);
    when(ownAdRepository.updateIfActive(
            eq("ad-1"), eq("u1"), eq(true), eq(false), eq(new BigDecimal("50.00")), any()))
        .thenReturn(Optional.of(updated));
    when(cardRepository.findById("card-1")).thenReturn(Optional.of(card));

    OwnAdResponse response =
        service.updateOwnAd("u1", "ad-1", new UpdateAdRequest(true, false, new BigDecimal("50")));

    assertEquals("ad-1", response.id());
  }

  @Test
  void shouldDropPriceWhenOnlyTradeIsEnabled() {
    when(ownAdRepository.updateIfActive(
            eq("ad-1"), eq("u1"), eq(false), eq(true), eq(null), any()))
        .thenReturn(Optional.of(ad(AdStatus.ACTIVE, 3)));
    when(cardRepository.findById("card-1")).thenReturn(Optional.of(card));

    service.updateOwnAd("u1", "ad-1", new UpdateAdRequest(false, true, new BigDecimal("50")));

    verify(ownAdRepository)
        .updateIfActive(eq("ad-1"), eq("u1"), eq(false), eq(true), eq(null), any());
  }

  @Test
  void shouldRequireModalityAndPriceWhenUpdating() {
    InvalidAdException noModality =
        assertThrows(
            InvalidAdException.class,
            () -> service.updateOwnAd("u1", "ad-1", new UpdateAdRequest(false, false, null)));
    assertEquals("modality", noModality.getField());

    InvalidAdException noPrice =
        assertThrows(
            InvalidAdException.class,
            () -> service.updateOwnAd("u1", "ad-1", new UpdateAdRequest(true, false, null)));
    assertEquals("unitPrice", noPrice.getField());

    verify(ownAdRepository, never())
        .updateIfActive(any(), any(), anyBoolean(), anyBoolean(), any(), any());
  }

  @Test
  void shouldRejectUpdateWhenAdIsNoLongerActive() {
    when(ownAdRepository.updateIfActive(any(), any(), anyBoolean(), anyBoolean(), any(), any()))
        .thenReturn(Optional.empty());
    when(adRepository.findByIdAndSellerId("ad-1", "u1"))
        .thenReturn(Optional.of(ad(AdStatus.SOLD_OUT, 0)));

    AdNotActiveException exception =
        assertThrows(
            AdNotActiveException.class,
            () ->
                service.updateOwnAd(
                    "u1", "ad-1", new UpdateAdRequest(true, true, new BigDecimal("10"))));

    assertEquals(AdStatus.SOLD_OUT, exception.getCurrentStatus());
  }

  @Test
  void shouldRejectUpdateOfAdFromAnotherUser() {
    when(ownAdRepository.updateIfActive(any(), any(), anyBoolean(), anyBoolean(), any(), any()))
        .thenReturn(Optional.empty());
    when(adRepository.findByIdAndSellerId("ad-1", "u2")).thenReturn(Optional.empty());

    assertThrows(
        AdNotFoundException.class,
        () -> service.updateOwnAd("u2", "ad-1", new UpdateAdRequest(false, true, null)));
  }

  @Test
  void shouldCancelActiveAdAndReportReleasedQuantity() {
    when(ownAdRepository.cancelIfActive(eq("ad-1"), eq("u1"), any()))
        .thenReturn(Optional.of(ad(AdStatus.CANCELLED, 2)));
    when(cardRepository.findById("card-1")).thenReturn(Optional.of(card));

    OwnAdResponse response = service.cancelOwnAd("u1", "ad-1");

    assertEquals(AdStatus.CANCELLED, response.status());
    assertEquals(2, response.releasedQuantity());
  }

  @Test
  void shouldTreatRepeatedCancelAsIdempotent() {
    when(ownAdRepository.cancelIfActive(eq("ad-1"), eq("u1"), any())).thenReturn(Optional.empty());
    when(adRepository.findByIdAndSellerId("ad-1", "u1"))
        .thenReturn(Optional.of(ad(AdStatus.CANCELLED, 2)));
    when(cardRepository.findById("card-1")).thenReturn(Optional.of(card));

    OwnAdResponse response = service.cancelOwnAd("u1", "ad-1");

    assertEquals(AdStatus.CANCELLED, response.status());
  }

  @Test
  void shouldRejectCancelOfSoldOutAd() {
    when(ownAdRepository.cancelIfActive(eq("ad-1"), eq("u1"), any())).thenReturn(Optional.empty());
    when(adRepository.findByIdAndSellerId("ad-1", "u1"))
        .thenReturn(Optional.of(ad(AdStatus.SOLD_OUT, 0)));

    assertThrows(AdNotActiveException.class, () -> service.cancelOwnAd("u1", "ad-1"));
  }

  @Test
  void shouldRequireAuthenticatedUser() {
    assertThrows(InvalidAuthenticationException.class, () -> service.cancelOwnAd(" ", "ad-1"));
    verifyNoInteractions(ownAdRepository, adRepository);
  }
}
