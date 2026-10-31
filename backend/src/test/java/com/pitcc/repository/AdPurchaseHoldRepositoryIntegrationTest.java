package com.pitcc.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.model.Ad;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
@ActiveProfiles("test")
class AdPurchaseHoldRepositoryIntegrationTest {

  @Autowired private AdRepository adRepository;
  @Autowired private AdPurchaseHoldRepository holdRepository;

  private Ad ad;

  @BeforeEach
  void setUp() {
    String seller = "hold-test-" + UUID.randomUUID();
    CollectionItem item =
        new CollectionItem(seller, "card-1", 5, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-" + UUID.randomUUID());
    ad = adRepository.save(
        new Ad(seller, item, 3, true, false, new BigDecimal("10.00"), null, Instant.now()));
  }

  @AfterEach
  void tearDown() {
    adRepository.deleteById(ad.getId());
  }

  private Ad reload() {
    return adRepository.findById(ad.getId()).orElseThrow();
  }

  @Test
  void reservesOnlyWhatIsStillAvailable() {
    assertTrue(holdRepository.reserve(ad.getId(), "order-1", 2, Instant.now()));
    assertFalse(holdRepository.reserve(ad.getId(), "order-2", 2, Instant.now()));
    assertTrue(holdRepository.reserve(ad.getId(), "order-3", 1, Instant.now()));

    Ad current = reload();
    assertEquals(3, current.heldForPurchase());
    assertEquals(0, current.availableForPurchase());
    assertEquals(3, current.getRemainingQuantity());
  }

  @Test
  void ignoresRepeatedReservationOfTheSameOrder() {
    assertTrue(holdRepository.reserve(ad.getId(), "order-1", 1, Instant.now()));
    assertFalse(holdRepository.reserve(ad.getId(), "order-1", 1, Instant.now()));

    assertEquals(1, reload().heldForPurchase());
  }

  @Test
  void doesNotReserveWhenSaleIsDisabled() {
    ReflectionTestUtils.setField(ad, "saleEnabled", false);
    ReflectionTestUtils.setField(ad, "tradeEnabled", true);
    adRepository.save(ad);

    assertFalse(holdRepository.reserve(ad.getId(), "order-1", 1, Instant.now()));
  }

  @Test
  void releasesOnlyTheReservationOfTheOrder() {
    holdRepository.reserve(ad.getId(), "order-1", 1, Instant.now());
    holdRepository.reserve(ad.getId(), "order-2", 2, Instant.now());

    holdRepository.release(ad.getId(), "order-1");
    holdRepository.release(ad.getId(), "order-1");

    Ad current = reload();
    assertEquals(2, current.heldForPurchase());
    assertEquals("order-2", current.getPurchaseHolds().getFirst().getOrderId());
  }
}
