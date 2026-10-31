package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.lenient;

import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.model.Ad;
import com.pitcc.model.AdPurchaseHold;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.Cart;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.User;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;
import com.pitcc.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CheckoutValidationServiceTest {

  private static final String BUYER = "buyer-1";
  private static final String SELLER = "seller-1";

  @Mock private CartRepository cartRepository;
  @Mock private AdRepository adRepository;
  @Mock private CardRepository cardRepository;
  @Mock private UserRepository userRepository;

  private CheckoutValidationService service;
  private Cart cart;
  private final Map<String, Ad> ads = new HashMap<>();
  private final List<Card> cards = new ArrayList<>();

  @BeforeEach
  void setUp() {
    service =
        new CheckoutValidationService(cartRepository, adRepository, cardRepository, userRepository);
    User seller = new User();
    seller.setId(SELLER);
    seller.setUsername("vendedor1");
    lenient().when(userRepository.findAllById(anyIterable())).thenReturn(List.of(seller));
    cart = new Cart(BUYER, Instant.now());

    lenient().when(cartRepository.findByUserId(BUYER)).thenAnswer(call -> Optional.ofNullable(cart));
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
    lenient().when(cardRepository.findAllById(anyIterable())).thenAnswer(call -> cards);

    Card card =
        new YugiohCard(
            "Dark Magician", "Starter", "sdy", "006", "Ultra Rare", "https://img/dm.png",
            "46986414", null, null, null, null, null, null, null, YugiohCardType.TRAP, List.of());
    ReflectionTestUtils.setField(card, "id", "card-1");
    cards.add(card);
  }

  private Ad ad(String id, String seller, int quantity, String price) {
    CollectionItem item =
        new CollectionItem(seller, "card-1", 10, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-" + id);

    Ad ad = new Ad(seller, item, quantity, true, false, new BigDecimal(price), null, Instant.now());
    ReflectionTestUtils.setField(ad, "id", id);
    ads.put(id, ad);
    return ad;
  }

  private Ad adInCart(String id, int adQuantity, int cartQuantity) {
    Ad ad = ad(id, SELLER, adQuantity, "10.00");
    cart.addItem(id, SELLER, cartQuantity, new BigDecimal("10.00"), adQuantity, Instant.now());
    return ad;
  }

  private ItemIssue onlyIssue(CheckoutValidationResponse result) {
    assertFalse(result.valid());
    assertEquals(1, result.items().size());
    return result.items().getFirst();
  }

  @Test
  void acceptsValidItemsAndGroupsThemBySeller() {
    adInCart("ad-1", 5, 2);
    adInCart("ad-2", 5, 1);
    ad("ad-3", "seller-2", 5, "7.50");
    cart.addItem("ad-3", "seller-2", 2, new BigDecimal("7.50"), 5, Instant.now());

    CheckoutValidationResponse result = service.validate(BUYER);

    assertTrue(result.valid());
    assertTrue(result.items().isEmpty());
    assertEquals(2, result.sellers().size());
    assertEquals(List.of("ad-1", "ad-2"), result.sellers().get(0).adIds());
    assertEquals("vendedor1", result.sellers().get(0).sellerUsername());
    assertNull(result.sellers().get(1).sellerUsername());
    assertEquals(0, new BigDecimal("30.00").compareTo(result.sellers().get(0).subtotal()));
    assertEquals(0, new BigDecimal("15.00").compareTo(result.sellers().get(1).subtotal()));
    assertEquals(0, new BigDecimal("45.00").compareTo(result.total()));
  }

  @Test
  void rejectsEmptySelection() {
    adInCart("ad-1", 5, 1);
    cart.select("ad-1", false, Instant.now());

    CheckoutValidationResponse result = service.validate(BUYER);

    assertFalse(result.valid());
    assertTrue(result.emptySelection());
  }

  @Test
  void rejectsMissingCart() {
    cart = null;

    assertTrue(service.validate(BUYER).emptySelection());
  }

  @Test
  void ignoresItemsThatAreNotSelected() {
    adInCart("ad-1", 5, 1);
    adInCart("ad-2", 5, 1);
    cart.select("ad-2", false, Instant.now());
    ads.remove("ad-2");

    CheckoutValidationResponse result = service.validate(BUYER);

    assertTrue(result.valid());
    assertEquals(List.of("ad-1"), result.sellers().getFirst().adIds());
  }

  @Test
  void detectsDeletedAd() {
    adInCart("ad-1", 5, 1);
    ads.remove("ad-1");

    ItemIssue issue = onlyIssue(service.validate(BUYER));

    assertEquals(List.of(IssueCode.AD_NOT_FOUND), issue.issues());
    assertEquals(0, issue.availableQuantity());
    assertNull(issue.currentUnitPrice());
  }

  @Test
  void detectsCancelledAd() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "status", AdStatus.CANCELLED);

    assertEquals(List.of(IssueCode.AD_CANCELLED), onlyIssue(service.validate(BUYER)).issues());
  }

  @Test
  void detectsSoldOutAd() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "status", AdStatus.SOLD_OUT);
    ReflectionTestUtils.setField(ad, "remainingQuantity", 0);

    assertEquals(List.of(IssueCode.AD_SOLD_OUT), onlyIssue(service.validate(BUYER)).issues());
  }

  @Test
  void detectsAdNoLongerForSale() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "saleEnabled", false);

    assertEquals(List.of(IssueCode.SALE_DISABLED), onlyIssue(service.validate(BUYER)).issues());
  }

  @Test
  void detectsReducedQuantityIncludingPurchaseHolds() {
    Ad ad = adInCart("ad-1", 5, 4);
    ReflectionTestUtils.setField(
        ad, "purchaseHolds", List.of(new AdPurchaseHold("order-1", 2, Instant.now())));

    ItemIssue issue = onlyIssue(service.validate(BUYER));

    assertEquals(List.of(IssueCode.QUANTITY_UNAVAILABLE), issue.issues());
    assertEquals(4, issue.requestedQuantity());
    assertEquals(3, issue.availableQuantity());
  }

  @Test
  void detectsQuantityFullyHeldByPendingOrders() {
    Ad ad = adInCart("ad-1", 2, 1);
    ReflectionTestUtils.setField(
        ad, "purchaseHolds", List.of(new AdPurchaseHold("order-1", 2, Instant.now())));

    ItemIssue issue = onlyIssue(service.validate(BUYER));

    assertEquals(List.of(IssueCode.QUANTITY_UNAVAILABLE), issue.issues());
    assertEquals(0, issue.availableQuantity());
  }

  @Test
  void detectsPriceChange() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "unitPrice", new BigDecimal("12.00"));

    ItemIssue issue = onlyIssue(service.validate(BUYER));

    assertEquals(List.of(IssueCode.PRICE_CHANGED), issue.issues());
    assertEquals(0, new BigDecimal("10.00").compareTo(issue.acceptedUnitPrice()));
    assertEquals(0, new BigDecimal("12.00").compareTo(issue.currentUnitPrice()));
  }

  @Test
  void treatsEquivalentPriceScaleAsUnchanged() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "unitPrice", new BigDecimal("10.0"));

    assertTrue(service.validate(BUYER).valid());
  }

  @Test
  void detectsOwnAd() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "sellerId", BUYER);

    assertTrue(onlyIssue(service.validate(BUYER)).issues().contains(IssueCode.OWN_AD));
  }

  @Test
  void detectsSellerChange() {
    Ad ad = adInCart("ad-1", 5, 1);
    ReflectionTestUtils.setField(ad, "sellerId", "seller-2");

    assertEquals(List.of(IssueCode.SELLER_CHANGED), onlyIssue(service.validate(BUYER)).issues());
  }

  @Test
  void detectsMissingCard() {
    adInCart("ad-1", 5, 1);
    cards.clear();

    assertEquals(List.of(IssueCode.CARD_NOT_FOUND), onlyIssue(service.validate(BUYER)).issues());
  }

  @Test
  void reportsOnlyInvalidItemsAndKeepsValidOnesGrouped() {
    adInCart("ad-1", 5, 1);
    Ad changed = adInCart("ad-2", 5, 1);
    ReflectionTestUtils.setField(changed, "status", AdStatus.CANCELLED);

    CheckoutValidationResponse result = service.validate(BUYER);

    assertFalse(result.valid());
    assertEquals("ad-2", onlyIssue(result).adId());
    assertEquals(List.of("ad-1"), result.sellers().getFirst().adIds());
  }
}
