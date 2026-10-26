package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.pitcc.dto.MarketplaceAdResponse;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.User;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.MarketplaceSearchRepository;
import com.pitcc.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MarketplaceServiceTest {

  @Mock private AdRepository adRepository;
  @Mock private CollectionItemRepository collectionItemRepository;
  @Mock private CardRepository cardRepository;
  @Mock private UserRepository userRepository;
  @Mock private MarketplaceSearchRepository marketplaceSearchRepository;

  private MarketplaceService service;

  @BeforeEach
  void setUp() {
    service =
        new MarketplaceService(
            adRepository,
            collectionItemRepository,
            cardRepository,
            userRepository,
            marketplaceSearchRepository);
  }

  private void stubAvailableAd() {
    CollectionItem item =
        new CollectionItem("seller-1", "card-1", 5, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-1");

    Ad ad = new Ad("seller-1", item, 3, true, true, new BigDecimal("45.00"), null, Instant.now());
    ReflectionTestUtils.setField(ad, "id", "ad-1");

    Card card =
        new YugiohCard(
            "Dark Magician", "Starter", "sdy", "006", "Ultra Rare", null, "46986414", null, null,
            null, null, null, null, null, YugiohCardType.TRAP, List.of());
    ReflectionTestUtils.setField(card, "id", "card-1");

    User seller = new User();
    seller.setId("seller-1");

    when(adRepository.findByIdAndStatusAndRemainingQuantityGreaterThan("ad-1", AdStatus.ACTIVE, 0))
        .thenReturn(Optional.of(ad));
    when(collectionItemRepository.findById("item-1")).thenReturn(Optional.of(item));
    when(cardRepository.findById("card-1")).thenReturn(Optional.of(card));
    when(userRepository.findById("seller-1")).thenReturn(Optional.of(seller));
  }

  @Test
  void shouldMarkAdAsOwnWhenViewerIsTheSeller() {
    stubAvailableAd();

    MarketplaceAdResponse response = service.getAvailableAd("ad-1", "seller-1");

    assertTrue(response.ownAd());
  }

  @Test
  void shouldNotMarkAdAsOwnForAnotherUser() {
    stubAvailableAd();

    MarketplaceAdResponse response = service.getAvailableAd("ad-1", "buyer-1");

    assertFalse(response.ownAd());
  }

  @Test
  void shouldNotMarkAdAsOwnForVisitors() {
    stubAvailableAd();

    MarketplaceAdResponse response = service.getAvailableAd("ad-1", null);

    assertFalse(response.ownAd());
  }

  @Test
  void shouldReturnNotFoundWhenAdIsUnavailable() {
    when(adRepository.findByIdAndStatusAndRemainingQuantityGreaterThan("ad-1", AdStatus.ACTIVE, 0))
        .thenReturn(Optional.empty());

    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> service.getAvailableAd("ad-1", null));

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
  }
}
