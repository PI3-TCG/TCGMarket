package com.pitcc.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.dto.OwnAdFilters;
import com.pitcc.model.Ad;
import com.pitcc.model.AdModality;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

/** Busca e alterações condicionais dos anúncios contra o MongoDB real do perfil test. */
@SpringBootTest
@ActiveProfiles("test")
class OwnAdRepositoryIntegrationTest {

  @Autowired OwnAdRepository ownAdRepository;
  @Autowired AdRepository adRepository;
  @Autowired CardRepository cardRepository;

  private final String run = UUID.randomUUID().toString().substring(0, 8);
  private final String seller = "seller-" + run;
  private final List<Ad> ads = new ArrayList<>();
  private Card mirror;
  private Card wall;

  @BeforeEach
  void seed() {
    mirror = cardRepository.save(trap("Mirror Force " + run));
    wall = cardRepository.save(trap("Magic Cylinder " + run));

    ads.add(save(ad(seller, mirror, true, false, Instant.parse("2026-10-01T10:00:00Z"))));
    ads.add(save(ad(seller, mirror, true, true, Instant.parse("2026-10-02T10:00:00Z"))));
    ads.add(save(ad(seller, wall, false, true, Instant.parse("2026-10-03T10:00:00Z"))));
    ads.add(save(ad("other-" + run, mirror, true, true, Instant.parse("2026-10-04T10:00:00Z"))));
  }

  @AfterEach
  void cleanup() {
    adRepository.deleteAll(ads);
    cardRepository.deleteAll(List.of(mirror, wall));
  }

  @Test
  void shouldListOnlyOwnAdsNewestFirst() {
    var page = search(new OwnAdFilters(null, null, null, null));

    assertEquals(3, page.getTotalElements());
    assertEquals(
        List.of(ads.get(2).getId(), ads.get(1).getId(), ads.get(0).getId()),
        page.getContent().stream().map(Ad::getId).toList());
  }

  @Test
  void shouldFilterByModalitySemantics() {
    assertEquals(2, search(new OwnAdFilters(null, null, AdModality.SALE, null)).getTotalElements());
    assertEquals(2, search(new OwnAdFilters(null, null, AdModality.TRADE, null)).getTotalElements());
    assertEquals(1, search(new OwnAdFilters(null, null, AdModality.BOTH, null)).getTotalElements());
  }

  @Test
  void shouldFilterByCardNameGameAndStatus() {
    assertEquals(
        2, search(new OwnAdFilters("mirror force " + run, null, null, null)).getTotalElements());
    assertEquals(
        3, search(new OwnAdFilters(run, CardGame.YUGIOH, null, null)).getTotalElements());
    assertEquals(0, search(new OwnAdFilters(run, CardGame.MAGIC_THE_GATHERING, null, null)).getTotalElements());

    ownAdRepository.cancelIfActive(ads.get(0).getId(), seller, Instant.now());

    assertEquals(
        1, search(new OwnAdFilters(null, null, null, AdStatus.CANCELLED)).getTotalElements());
    assertEquals(2, search(new OwnAdFilters(null, null, null, AdStatus.ACTIVE)).getTotalElements());
  }

  @Test
  void shouldUpdateOnlyActiveAdOfTheSeller() {
    String adId = ads.get(0).getId();

    assertTrue(
        ownAdRepository
            .updateIfActive(adId, "other-" + run, false, true, null, Instant.now())
            .isEmpty());

    Ad updated =
        ownAdRepository.updateIfActive(adId, seller, false, true, null, Instant.now()).orElseThrow();
    assertTrue(updated.isTradeEnabled());
    assertNull(updated.getUnitPrice());
    assertEquals(3, updated.getQuantity());

    ownAdRepository.cancelIfActive(adId, seller, Instant.now());

    assertTrue(
        ownAdRepository
            .updateIfActive(adId, seller, true, true, new BigDecimal("10.00"), Instant.now())
            .isEmpty());
  }

  @Test
  void shouldCancelOnceAndKeepRemainingQuantity() {
    String adId = ads.get(1).getId();

    Ad cancelled = ownAdRepository.cancelIfActive(adId, seller, Instant.now()).orElseThrow();

    assertEquals(AdStatus.CANCELLED, cancelled.getStatus());
    assertNotNull(cancelled.getCancelledAt());
    assertEquals(3, cancelled.getRemainingQuantity());
    assertTrue(ownAdRepository.cancelIfActive(adId, seller, Instant.now()).isEmpty());
  }

  private org.springframework.data.domain.Page<Ad> search(OwnAdFilters filters) {
    return ownAdRepository.findOwnAds(seller, filters, PageRequest.of(0, 20));
  }

  private Ad save(Ad ad) {
    return adRepository.save(ad);
  }

  private static Ad ad(String sellerId, Card card, boolean sale, boolean trade, Instant createdAt) {
    CollectionItem item =
        new CollectionItem(sellerId, card.getId(), 5, CardCondition.NEAR_MINT, CardLanguage.ENGLISH);
    ReflectionTestUtils.setField(item, "id", "item-" + UUID.randomUUID());
    return new Ad(sellerId, item, 3, sale, trade, sale ? new BigDecimal("12.50") : null, null, createdAt);
  }

  private Card trap(String name) {
    return new YugiohCard(
        name, "Legend " + run, "yg-" + run, null, "Ultra Rare", null, "yg-" + name, null, null,
        null, null, null, null, null, YugiohCardType.TRAP, List.of());
  }
}
