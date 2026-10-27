package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.pitcc.dto.CartItemResponse;
import com.pitcc.dto.CartItemResponse.CartItemAvailability;
import com.pitcc.dto.CartResponse;
import com.pitcc.dto.UpdateCartItemRequest;
import com.pitcc.exception.AdUnavailableForPurchaseException;
import com.pitcc.exception.CartConflictException;
import com.pitcc.exception.CartItemNotFoundException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.Cart;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

  private static final String BUYER = "buyer-1";
  private static final String SELLER = "seller-1";

  @Mock private CartRepository cartRepository;
  @Mock private AdRepository adRepository;
  @Mock private CardRepository cardRepository;

  private CartService service;
  private Cart stored;
  private final Map<String, Ad> ads = new HashMap<>();
  private final AtomicInteger failingSaves = new AtomicInteger();

  @BeforeEach
  void setUp() {
    service = new CartService(cartRepository, adRepository, cardRepository);

    lenient().when(cartRepository.findByUserId(BUYER)).thenAnswer(call -> Optional.ofNullable(stored));
    lenient()
        .when(cartRepository.save(any(Cart.class)))
        .thenAnswer(
            call -> {
              if (failingSaves.getAndDecrement() > 0) {
                throw new OptimisticLockingFailureException("outra aba gravou primeiro");
              }
              stored = call.getArgument(0);
              return stored;
            });
    lenient()
        .when(adRepository.findById(any()))
        .thenAnswer(call -> Optional.ofNullable(ads.get(call.<String>getArgument(0))));
    lenient()
        .when(adRepository.findAllById(anyIterable()))
        .thenAnswer(
            call -> {
              List<Ad> found = new ArrayList<>();
              call.<Iterable<String>>getArgument(0).forEach(id -> {
                if (ads.containsKey(id)) found.add(ads.get(id));
              });
              return found;
            });

    Card card =
        new YugiohCard(
            "Dark Magician", "Starter", "sdy", "006", "Ultra Rare", "https://img/dm.png",
            "46986414", null, null, null, null, null, null, null, YugiohCardType.TRAP, List.of());
    ReflectionTestUtils.setField(card, "id", "card-1");
    lenient().when(cardRepository.findAllById(anyIterable())).thenReturn(List.of(card));
  }

  private Ad ad(String id, int quantity, String price) {
    CollectionItem item =
        new CollectionItem(SELLER, "card-1", 10, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-" + id);

    Ad ad = new Ad(SELLER, item, quantity, true, false, new BigDecimal(price), null, Instant.now());
    ReflectionTestUtils.setField(ad, "id", id);
    ads.put(id, ad);
    return ad;
  }

  private CartItemResponse only(CartResponse cart) {
    assertEquals(1, cart.items().size());
    return cart.items().getFirst();
  }

  @Test
  void addsAdWithCurrentPriceAndCardData() {
    ad("ad-1", 3, "45.00");

    CartItemResponse item = only(service.addItem(BUYER, "ad-1", 2));

    assertEquals("Dark Magician", item.cardName());
    assertEquals(2, item.quantity());
    assertTrue(item.selected());
    assertEquals(new BigDecimal("45.00"), item.acceptedUnitPrice());
    assertEquals(CartItemAvailability.AVAILABLE, item.availability());
    assertFalse(item.priceChanged());
  }

  @Test
  void rejectsOwnAd() {
    ad("ad-1", 3, "45.00");

    IllegalArgumentException error =
        assertThrows(IllegalArgumentException.class, () -> service.addItem(SELLER, "ad-1", 1));

    assertEquals("Não é possível comprar o próprio anúncio.", error.getMessage());
  }

  @Test
  void limitsQuantityConsideringWhatIsAlreadyInTheCart() {
    ad("ad-1", 3, "45.00");
    service.addItem(BUYER, "ad-1", 2);

    AdUnavailableForPurchaseException error =
        assertThrows(
            AdUnavailableForPurchaseException.class, () -> service.addItem(BUYER, "ad-1", 2));

    assertEquals(
        "Há apenas 3 exemplares disponíveis e você já tem 2 no carrinho.", error.getMessage());
    assertEquals(2, only(service.getCart(BUYER)).quantity());
  }

  @Test
  void rejectsCancelledAndTradeOnlyAds() {
    Ad cancelled = ad("ad-1", 3, "45.00");
    ReflectionTestUtils.setField(cancelled, "status", AdStatus.CANCELLED);

    Ad tradeOnly = ad("ad-2", 3, "45.00");
    ReflectionTestUtils.setField(tradeOnly, "saleEnabled", false);

    assertThrows(AdUnavailableForPurchaseException.class, () -> service.addItem(BUYER, "ad-1", 1));
    assertThrows(AdUnavailableForPurchaseException.class, () -> service.addItem(BUYER, "ad-2", 1));
    verify(cartRepository, never()).save(any());
  }

  @Test
  void readingShowsUnavailableReducedAndChangedPriceWithoutChangingTheCart() {
    Ad gone = ad("gone", 3, "10.00");
    Ad reduced = ad("reduced", 3, "20.00");
    Ad repriced = ad("repriced", 3, "30.00");

    service.addItem(BUYER, "gone", 1);
    service.addItem(BUYER, "reduced", 3);
    service.addItem(BUYER, "repriced", 1);

    ReflectionTestUtils.setField(gone, "status", AdStatus.SOLD_OUT);
    ReflectionTestUtils.setField(reduced, "remainingQuantity", 1);
    ReflectionTestUtils.setField(repriced, "unitPrice", new BigDecimal("35.00"));

    List<CartItemResponse> items = service.getCart(BUYER).items();

    assertEquals(CartItemAvailability.UNAVAILABLE, items.get(0).availability());
    assertFalse(items.get(0).selected());
    assertNull(items.get(0).currentUnitPrice());

    assertEquals(CartItemAvailability.REDUCED, items.get(1).availability());
    assertEquals(3, items.get(1).quantity());
    assertEquals(1, items.get(1).availableQuantity());

    assertTrue(items.get(2).priceChanged());
    assertEquals(new BigDecimal("30.00"), items.get(2).acceptedUnitPrice());
    assertEquals(new BigDecimal("35.00"), items.get(2).currentUnitPrice());

    assertTrue(stored.getItems().getFirst().isSelected());
  }

  @Test
  void acceptingTheNewPriceAndAdjustingQuantity() {
    Ad ad = ad("ad-1", 3, "45.00");
    service.addItem(BUYER, "ad-1", 3);

    ReflectionTestUtils.setField(ad, "unitPrice", new BigDecimal("50.00"));
    ReflectionTestUtils.setField(ad, "remainingQuantity", 1);

    assertThrows(
        AdUnavailableForPurchaseException.class,
        () -> service.updateItem(BUYER, "ad-1", new UpdateCartItemRequest(2, null, null)));

    CartItemResponse item =
        only(service.updateItem(BUYER, "ad-1", new UpdateCartItemRequest(1, null, true)));

    assertEquals(1, item.quantity());
    assertEquals(new BigDecimal("50.00"), item.acceptedUnitPrice());
    assertFalse(item.priceChanged());
    assertEquals(CartItemAvailability.AVAILABLE, item.availability());
  }

  @Test
  void updatingAnAdThatIsNotInTheCartIsNotFound() {
    ad("ad-1", 3, "45.00");

    assertThrows(
        CartItemNotFoundException.class,
        () -> service.updateItem(BUYER, "ad-1", new UpdateCartItemRequest(1, null, null)));
  }

  @Test
  void selectAllSkipsUnavailableAds() {
    Ad gone = ad("gone", 3, "10.00");
    ad("ok", 3, "20.00");
    service.addItem(BUYER, "gone", 1);
    service.addItem(BUYER, "ok", 1);
    service.updateSelection(BUYER, false);

    ReflectionTestUtils.setField(gone, "status", AdStatus.CANCELLED);

    List<CartItemResponse> items = service.updateSelection(BUYER, true).items();

    assertFalse(items.get(0).selected());
    assertTrue(items.get(1).selected());
  }

  @Test
  void removingIsIdempotent() {
    ad("ad-1", 3, "45.00");
    service.addItem(BUYER, "ad-1", 1);

    assertEquals(0, service.removeItem(BUYER, "ad-1").distinctItemCount());
    assertEquals(0, service.removeItem(BUYER, "ad-1").distinctItemCount());
  }

  @Test
  void emptyCartWithoutCreatingDocument() {
    CartResponse cart = service.getCart(BUYER);

    assertTrue(cart.items().isEmpty());
    assertEquals(0, cart.distinctItemCount());
    assertEquals(0, service.removeItem(BUYER, "ad-1").distinctItemCount());
    verify(cartRepository, never()).save(any());
  }

  @Test
  void retriesWhenAnotherTabSavedFirst() {
    ad("ad-1", 3, "45.00");
    failingSaves.set(1);

    assertEquals(1, only(service.addItem(BUYER, "ad-1", 1)).quantity());
  }

  @Test
  void givesUpAfterRepeatedConflicts() {
    ad("ad-1", 3, "45.00");
    failingSaves.set(10);

    assertThrows(CartConflictException.class, () -> service.addItem(BUYER, "ad-1", 1));
  }
}
