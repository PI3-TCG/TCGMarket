package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.dto.CheckoutOrdersResponse;
import com.pitcc.dto.CheckoutOrdersResponse.OrderResponse;
import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.exception.AddressNotFoundException;
import com.pitcc.exception.CheckoutConflictException;
import com.pitcc.model.Ad;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.Cart;
import com.pitcc.model.Checkout;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.Order;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserAddress;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;
import com.pitcc.repository.CheckoutRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.UserAddressRepository;
import com.pitcc.repository.UserRepository;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PlaceOrderServiceTest {

  private static final String BUYER = "buyer-1";
  private static final String KEY = "key-1";
  private static final CheckoutValidationResponse VALID =
      new CheckoutValidationResponse(true, false, List.of(), List.of(), BigDecimal.ZERO);

  @Mock private CheckoutValidationService validationService;
  @Mock private CheckoutRepository checkoutRepository;
  @Mock private OrderRepository orderRepository;
  @Mock private CartRepository cartRepository;
  @Mock private AdRepository adRepository;
  @Mock private CardRepository cardRepository;
  @Mock private UserAddressRepository addressRepository;
  @Mock private UserRepository userRepository;
  @Mock private AdPurchaseHoldRepository holdRepository;
  @Mock private PaymentService paymentService;

  private PlaceOrderService service;
  private Cart cart;
  private final Map<String, Ad> ads = new HashMap<>();
  private final List<Order> savedOrders = new ArrayList<>();

  @BeforeEach
  void setUp() {
    service =
        new PlaceOrderService(
            validationService, checkoutRepository, orderRepository, cartRepository, adRepository,
            cardRepository, addressRepository, userRepository, holdRepository, paymentService);
    cart = new Cart(BUYER, Instant.now());

    Card card =
        new YugiohCard(
            "Dark Magician", "Starter", "sdy", "006", "Ultra Rare", "https://img/dm.png",
            "46986414", null, null, null, null, null, null, null, YugiohCardType.TRAP, List.of());
    ReflectionTestUtils.setField(card, "id", "card-1");

    DeliveryAddress address =
        new DeliveryAddress("Ana", "01001000", "Rua A", "10", false, null, "Centro", "São Paulo", "SP");
    UserAddress userAddress = new UserAddress(BUYER, "Casa", address, true, Instant.now());

    lenient().when(cartRepository.findByUserId(BUYER)).thenAnswer(call -> Optional.of(cart));
    lenient()
        .when(adRepository.findAllById(anyIterable()))
        .thenAnswer(
            call -> {
              List<Ad> found = new ArrayList<>();
              call.<Iterable<String>>getArgument(0).forEach(id -> found.add(ads.get(id)));
              return found;
            });
    lenient().when(cardRepository.findAllById(anyIterable())).thenReturn(List.of(card));
    lenient()
        .when(addressRepository.findByIdAndUserId("addr-1", BUYER))
        .thenReturn(Optional.of(userAddress));
    lenient().when(validationService.validate(BUYER)).thenReturn(VALID);
    lenient()
        .when(checkoutRepository.save(any(Checkout.class)))
        .thenAnswer(
            call -> {
              Checkout checkout = call.getArgument(0);
              ReflectionTestUtils.setField(checkout, "id", "checkout-1");
              return checkout;
            });

    AtomicInteger sequence = new AtomicInteger();
    lenient()
        .when(orderRepository.save(any(Order.class)))
        .thenAnswer(
            call -> {
              Order order = call.getArgument(0);
              ReflectionTestUtils.setField(order, "id", "order-" + sequence.incrementAndGet());
              savedOrders.add(order);
              return order;
            });
    lenient().when(holdRepository.reserve(anyString(), anyString(), anyInt(), any())).thenReturn(true);
    lenient().when(orderRepository.findByCheckoutId("checkout-1")).thenAnswer(call -> savedOrders);

    User seller = new User();
    seller.setId("seller-1");
    seller.setUsername("vendedor1");
    lenient().when(userRepository.findAllById(anyIterable())).thenReturn(List.of(seller));
  }

  private void adInCart(String id, String seller, int quantity, String price) {
    CollectionItem item =
        new CollectionItem(seller, "card-1", 10, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-" + id);
    Ad ad = new Ad(seller, item, 5, true, false, new BigDecimal(price), null, Instant.now());
    ReflectionTestUtils.setField(ad, "id", id);
    ads.put(id, ad);
    cart.addItem(id, seller, quantity, new BigDecimal(price), 5, Instant.now());
  }

  @Test
  void createsOneOrderPerSellerWithCopiedValuesAndReservesCopies() {
    adInCart("ad-1", "seller-1", 2, "10.00");
    adInCart("ad-2", "seller-1", 1, "5.50");
    adInCart("ad-3", "seller-2", 3, "7.00");

    CheckoutOrdersResponse response = service.placeOrder(BUYER, KEY, "addr-1");

    assertEquals("checkout-1", response.checkoutId());
    assertEquals(2, response.orders().size());
    assertEquals(0, new BigDecimal("46.50").compareTo(response.total()));

    OrderResponse first = response.orders().getFirst();
    assertEquals("seller-1", first.sellerId());
    assertEquals("vendedor1", first.sellerUsername());
    assertEquals(OrderStatus.PENDING_PAYMENT, first.status());
    assertEquals(0, new BigDecimal("25.50").compareTo(first.totalAmount()));
    assertEquals("Dark Magician", first.items().getFirst().cardName());
    assertEquals(CardCondition.NEAR_MINT, first.items().getFirst().condition());
    assertEquals(2, first.items().getFirst().quantity());
    assertEquals("Ana", first.deliveryAddress().getRecipientName());

    Order saved = savedOrders.getFirst();
    assertEquals("checkout-1", saved.getCheckoutId());
    assertEquals("item-ad-1", saved.getItems().getFirst().getCollectionItemId());

    verify(holdRepository).reserve(eq("ad-1"), eq("order-1"), eq(2), any());
    verify(holdRepository).reserve(eq("ad-2"), eq("order-1"), eq(1), any());
    verify(holdRepository).reserve(eq("ad-3"), eq("order-2"), eq(3), any());
    verify(cartRepository, never()).save(any());
    verify(paymentService).startPayments(BUYER, savedOrders);
  }

  @Test
  void returnsExistingOrdersForRepeatedIdempotencyKey() {
    Checkout checkout = new Checkout(BUYER, KEY, Instant.now());
    ReflectionTestUtils.setField(checkout, "id", "checkout-1");
    when(checkoutRepository.findByBuyerIdAndIdempotencyKey(BUYER, KEY))
        .thenReturn(Optional.of(checkout));
    when(orderRepository.findByCheckoutId("checkout-1")).thenReturn(List.of());

    CheckoutOrdersResponse response = service.placeOrder(BUYER, KEY, "addr-1");

    assertEquals("checkout-1", response.checkoutId());
    verifyNoInteractions(validationService, holdRepository);
    verify(checkoutRepository, never()).save(any());
  }

  @Test
  void rejectsCartThatNeedsReview() {
    CheckoutValidationResponse invalid =
        new CheckoutValidationResponse(
            false, false,
            List.of(new ItemIssue("ad-1", List.of(IssueCode.PRICE_CHANGED), 1, 5,
                new BigDecimal("10"), new BigDecimal("12"))),
            List.of(), BigDecimal.ZERO);
    when(validationService.validate(BUYER)).thenReturn(invalid);

    CheckoutConflictException exception =
        assertThrows(CheckoutConflictException.class, () -> service.placeOrder(BUYER, KEY, "addr-1"));

    assertSame(invalid, exception.getValidation());
    verify(checkoutRepository, never()).save(any());
    verifyNoInteractions(orderRepository, holdRepository);
  }

  @Test
  void rejectsAddressOfAnotherUser() {
    adInCart("ad-1", "seller-1", 1, "10.00");

    assertThrows(AddressNotFoundException.class, () -> service.placeOrder(BUYER, KEY, "addr-2"));

    verify(checkoutRepository, never()).save(any());
  }

  @Test
  void requiresIdempotencyKey() {
    assertThrows(IllegalArgumentException.class, () -> service.placeOrder(BUYER, " ", "addr-1"));

    verifyNoInteractions(checkoutRepository, orderRepository);
  }

  @Test
  void undoesEverythingWhenAReservationFails() {
    adInCart("ad-1", "seller-1", 2, "10.00");
    adInCart("ad-2", "seller-2", 1, "5.00");
    when(holdRepository.reserve(eq("ad-2"), anyString(), anyInt(), any())).thenReturn(false);
    when(adRepository.findById("ad-2")).thenReturn(Optional.of(ads.get("ad-2")));

    CheckoutConflictException exception =
        assertThrows(CheckoutConflictException.class, () -> service.placeOrder(BUYER, KEY, "addr-1"));

    ItemIssue issue = exception.getValidation().items().getFirst();
    assertEquals("ad-2", issue.adId());
    assertEquals(List.of(IssueCode.QUANTITY_UNAVAILABLE), issue.issues());

    verify(holdRepository).release("ad-1", "order-1");
    verify(holdRepository).release("ad-2", "order-2");
    verify(orderRepository).deleteAll(savedOrders);
    verify(checkoutRepository).delete(any(Checkout.class));
    verifyNoInteractions(paymentService);
  }
}
