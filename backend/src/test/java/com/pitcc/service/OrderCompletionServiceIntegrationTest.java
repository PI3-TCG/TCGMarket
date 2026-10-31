package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.model.Ad;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.TransactionType;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
@ActiveProfiles("test")
class OrderCompletionServiceIntegrationTest {

  private static final String CARD = "card-1";

  @Autowired private OrderCompletionService service;
  @Autowired private AdRepository adRepository;
  @Autowired private AdPurchaseHoldRepository holdRepository;
  @Autowired private CollectionItemRepository collectionItemRepository;
  @Autowired private OrderRepository orderRepository;
  @Autowired private TransactionRepository transactionRepository;

  private String seller;
  private String buyer;
  private CollectionItem sellerItem;
  private Ad ad;
  private final List<String> orderIds = new ArrayList<>();

  @BeforeEach
  void setUp() {
    seller = "completion-seller-" + UUID.randomUUID();
    buyer = "completion-buyer-" + UUID.randomUUID();
  }

  @AfterEach
  void tearDown() {
    adRepository.deleteById(ad.getId());
    collectionItemRepository.deleteAll(owned(seller));
    collectionItemRepository.deleteAll(owned(buyer));
    orderIds.forEach(orderRepository::deleteById);
    orderIds.forEach(id -> transactionRepository.deleteAll(
        transactionRepository.findAll().stream().filter(t -> id.equals(t.getSourceId())).toList()));
  }

  // Vendedor com `owned` exemplares, `advertised` deles num anúncio ativo.
  private void sellerWith(int owned, int advertised) {
    sellerItem =
        new CollectionItem(seller, CARD, owned, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(sellerItem, "id", "item-" + UUID.randomUUID());
    ad = adRepository.save(
        new Ad(seller, sellerItem, advertised, true, false, new BigDecimal("10.00"), null, Instant.now()));

    AdReservation reservation =
        new AdReservation(ad.getId(), advertised, true, false, new BigDecimal("10.00"), Instant.now());
    ReflectionTestUtils.setField(reservation, "status", AdReservationStatus.ACTIVE);
    ReflectionTestUtils.setField(sellerItem, "committedQuantity", advertised);
    ReflectionTestUtils.setField(sellerItem, "adReservations", new ArrayList<>(List.of(reservation)));
    sellerItem = collectionItemRepository.save(sellerItem);
  }

  private Order paidOrder(int quantity) {
    CardSnapshot card =
        new CardSnapshot(CARD, "Dark Magician", CardGame.YUGIOH, "Starter", "006", null,
            CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    DeliveryAddress address =
        new DeliveryAddress("Ana", "01001000", "Rua A", "10", false, null, "Centro", "São Paulo", "SP");
    Order order = new Order(
        "checkout-" + UUID.randomUUID(), buyer, seller,
        List.of(new OrderItem(ad.getId(), sellerItem.getId(), card, quantity, new BigDecimal("10.00"))),
        address, Instant.now());
    order.markPaid(Instant.now());
    order = orderRepository.save(order);
    orderIds.add(order.getId());
    assertTrue(holdRepository.reserve(ad.getId(), order.getId(), quantity, Instant.now()));
    return order;
  }

  private List<CollectionItem> owned(String user) {
    return collectionItemRepository.findByUserId(user, Pageable.unpaged()).getContent();
  }

  private CollectionItem sellerItemNow() {
    return collectionItemRepository.findById(sellerItem.getId()).orElse(null);
  }

  private int buyerQuantity() {
    return owned(buyer).stream()
        .mapToInt(CollectionItem::getQuantity).sum();
  }

  @Test
  void transfersCardsAndCompletesTheOrderOnlyOnce() {
    sellerWith(5, 3);
    Order order = paidOrder(2);

    service.complete(order.getId());
    service.complete(order.getId());

    CollectionItem current = sellerItemNow();
    assertEquals(3, current.getQuantity().intValue());
    assertEquals(1, current.getCommittedQuantity().intValue());
    assertEquals(1, current.getAdReservations().getFirst().getQuantity());

    Ad currentAd = adRepository.findById(ad.getId()).orElseThrow();
    assertEquals(1, currentAd.getRemainingQuantity());
    assertTrue(currentAd.getPurchaseHolds().isEmpty());
    assertEquals(AdStatus.ACTIVE, currentAd.getStatus());

    assertEquals(2, buyerQuantity());
    assertEquals(OrderStatus.COMPLETED, orderRepository.findById(order.getId()).orElseThrow().getStatus());
    assertEquals(1, transactionRepository.findAll().stream()
        .filter(t -> t.getType() == TransactionType.SALE && order.getId().equals(t.getSourceId()))
        .count());
  }

  @Test
  void soldOutAdClosesTheReservationAndKeepsTheRestOfTheCollection() {
    sellerWith(5, 3);
    Order order = paidOrder(3);

    service.complete(order.getId());

    CollectionItem current = sellerItemNow();
    assertEquals(2, current.getQuantity().intValue());
    assertEquals(0, current.getCommittedQuantity().intValue());
    assertEquals(AdReservationStatus.CANCELLED, current.getAdReservations().getFirst().getStatus());
    assertEquals(AdStatus.SOLD_OUT, adRepository.findById(ad.getId()).orElseThrow().getStatus());
    assertEquals(3, buyerQuantity());
  }

  @Test
  void removesTheSellerItemWhenNoCopiesAreLeftAndRetriesSafely() {
    sellerWith(3, 3);
    Order order = paidOrder(3);

    service.complete(order.getId());
    // Simula uma queda logo antes de marcar o pedido como concluído.
    Order interrupted = orderRepository.findById(order.getId()).orElseThrow();
    ReflectionTestUtils.setField(interrupted, "status", OrderStatus.PAID);
    orderRepository.save(interrupted);
    service.complete(order.getId());

    assertEquals(null, sellerItemNow());
    assertEquals(3, buyerQuantity());
    assertEquals(OrderStatus.COMPLETED, orderRepository.findById(order.getId()).orElseThrow().getStatus());
  }

  @Test
  void addsToTheCopiesTheBuyerAlreadyHas() {
    sellerWith(5, 3);
    collectionItemRepository.save(
        new CollectionItem(buyer, CARD, 4, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE));
    Order order = paidOrder(1);

    service.complete(order.getId());

    List<CollectionItem> owned = owned(buyer);
    assertEquals(1, owned.size());
    assertEquals(5, owned.getFirst().getQuantity().intValue());
  }

  @Test
  void keepsTheOrderPaidWhenTheSellerCollectionIsInconsistent() {
    sellerWith(5, 3);
    Order order = paidOrder(2);
    CollectionItem broken = sellerItemNow();
    ReflectionTestUtils.setField(
        broken.getAdReservations().getFirst(), "status", AdReservationStatus.PENDING_UPDATE);
    ReflectionTestUtils.setField(broken, "adReservations", new ArrayList<>(broken.getAdReservations()));
    collectionItemRepository.save(broken);

    assertThrows(IllegalStateException.class, () -> service.complete(order.getId()));

    assertEquals(OrderStatus.PAID, orderRepository.findById(order.getId()).orElseThrow().getStatus());
    assertEquals(0, buyerQuantity());
    assertEquals(3, adRepository.findById(ad.getId()).orElseThrow().getRemainingQuantity());
  }
}
