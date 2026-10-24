package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.dto.CreateAdRequest;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CollectionItemRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CreateAdServiceTest {

  @Mock private CollectionItemRepository collectionItemRepository;
  @Mock private AdRepository adRepository;
  @Mock private AdAvailabilityService adAvailabilityService;

  private CreateAdService service;
  private CollectionItem item;

  @BeforeEach
  void setUp() {
    service = new CreateAdService(collectionItemRepository, adRepository, adAvailabilityService);
    item = new CollectionItem("u1", "card-1", 5, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-1");
  }

  private void givenOwnedItemWithAvailability(int committed) {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));
    when(adAvailabilityService.availabilityOf(item))
        .thenReturn(new CollectionItemAvailabilityResponse(5, committed, 5 - committed));
  }

  private void givenSaveReturnsAd() {
    when(adRepository.save(any(Ad.class)))
        .thenAnswer(
            invocation -> {
              Ad ad = invocation.getArgument(0);
              ReflectionTestUtils.setField(ad, "id", "ad-1");
              return ad;
            });
  }

  @Test
  void shouldCreateSaleAndTradeAdForOwnItem() {
    givenOwnedItemWithAvailability(2);
    givenSaveReturnsAd();

    AdResponse response =
        service.createAd(
            "u1", new CreateAdRequest("item-1", 2, true, true, new BigDecimal("45"), null));

    ArgumentCaptor<Ad> captor = ArgumentCaptor.forClass(Ad.class);
    verify(adRepository).save(captor.capture());
    Ad saved = captor.getValue();

    assertEquals("u1", saved.getSellerId());
    assertEquals("item-1", saved.getCollectionItemId());
    assertEquals("card-1", saved.getCardId());
    assertEquals(CardCondition.NEAR_MINT, saved.getCondition());
    assertEquals(CardLanguage.PORTUGUESE, saved.getLanguage());
    assertEquals(2, saved.getQuantity());
    assertEquals(2, saved.getRemainingQuantity());
    assertTrue(saved.isSaleEnabled());
    assertTrue(saved.isTradeEnabled());
    assertEquals(new BigDecimal("45.00"), saved.getUnitPrice());
    assertEquals(AdStatus.ACTIVE, saved.getStatus());

    assertEquals("ad-1", response.id());
    assertEquals(new CollectionItemAvailabilityResponse(5, 4, 1), response.availability());
  }

  @Test
  void shouldIgnorePriceOnTradeOnlyAd() {
    givenOwnedItemWithAvailability(0);
    givenSaveReturnsAd();

    service.createAd("u1", new CreateAdRequest("item-1", 1, false, true, new BigDecimal("10"), null));

    ArgumentCaptor<Ad> captor = ArgumentCaptor.forClass(Ad.class);
    verify(adRepository).save(captor.capture());
    assertFalse(captor.getValue().isSaleEnabled());
    assertNull(captor.getValue().getUnitPrice());
  }

  @Test
  void shouldAllowAnnouncingAllAvailableCopies() {
    givenOwnedItemWithAvailability(2);
    givenSaveReturnsAd();

    AdResponse response =
        service.createAd(
            "u1", new CreateAdRequest("item-1", 3, true, false, new BigDecimal("1.50"), null));

    assertEquals(0, response.availability().availableQuantity());
  }

  @Test
  void shouldRejectQuantityAboveAvailability() {
    givenOwnedItemWithAvailability(4);

    AdQuantityUnavailableException exception =
        assertThrows(
            AdQuantityUnavailableException.class,
            () ->
                service.createAd(
                    "u1", new CreateAdRequest("item-1", 2, true, false, new BigDecimal("10"), null)));

    assertEquals(1, exception.getAvailableQuantity());
    verify(adRepository, never()).save(any());
  }

  @Test
  void shouldRejectItemOfAnotherUser() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u2")).thenReturn(Optional.empty());

    assertThrows(
        CollectionItemNotFoundException.class,
        () ->
            service.createAd(
                "u2", new CreateAdRequest("item-1", 1, true, false, new BigDecimal("10"), null)));

    verifyNoInteractions(adRepository, adAvailabilityService);
  }

  @Test
  void shouldRequireAtLeastOneModality() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));

    InvalidAdException exception =
        assertThrows(
            InvalidAdException.class,
            () -> service.createAd("u1", new CreateAdRequest("item-1", 1, false, false, null, null)));

    assertEquals("modality", exception.getField());
    verifyNoInteractions(adRepository);
  }

  @Test
  void shouldRequirePriceWhenSaleIsEnabled() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));

    InvalidAdException exception =
        assertThrows(
            InvalidAdException.class,
            () -> service.createAd("u1", new CreateAdRequest("item-1", 1, true, false, null, null)));

    assertEquals("unitPrice", exception.getField());
    verifyNoInteractions(adRepository);
  }

  @Test
  void shouldRequireAuthenticatedUser() {
    assertThrows(
        InvalidAuthenticationException.class,
        () -> service.createAd(" ", new CreateAdRequest("item-1", 1, false, true, null, null)));

    verifyNoInteractions(collectionItemRepository, adRepository, adAvailabilityService);
  }
}
