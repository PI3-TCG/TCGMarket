package com.pitcc.repository;

import com.pitcc.dto.MarketplaceFilters;
import com.pitcc.model.Ad;
import com.pitcc.model.AdPurchaseHold;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;

import org.bson.Document;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MarketplaceSearchRepositoryIntegrationTest {

    @Autowired
    private MarketplaceSearchRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    private String token;
    private String sellerId;
    private final List<String> cardIds = new ArrayList<>();
    private final List<String> itemIds = new ArrayList<>();
    private final List<String> adIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        token = UUID.randomUUID().toString().substring(0, 8);
        sellerId = "marketplace-search-" + token;
    }

    @AfterEach
    void tearDown() {
        mongoTemplate.remove(Query.query(Criteria.where("_id").in(adIds)), Ad.class);
        mongoTemplate.remove(Query.query(Criteria.where("_id").in(itemIds)), CollectionItem.class);
        mongoTemplate.remove(Query.query(Criteria.where("_id").in(cardIds)), Card.class);
    }

    private String card(String name, CardGame game, String edition, String rarity) {
        String id = "card-" + UUID.randomUUID();
        mongoTemplate.getCollection(mongoTemplate.getCollectionName(Card.class)).insertOne(
                new Document("_id", id)
                        .append("name", name + " " + token)
                        .append("game", game.name())
                        .append("edition", edition)
                        .append("officialRarity", rarity)
                        .append("source", "SCRYFALL")
                        .append("externalId", id));
        cardIds.add(id);
        return id;
    }

    private Ad ad(String cardId, CardCondition condition, CardLanguage language,
                  boolean sale, boolean trade, String price) {
        String ownerId = sellerId + "-" + adIds.size();
        CollectionItem item = mongoTemplate.save(
                new CollectionItem(ownerId, cardId, 5, condition, language));
        itemIds.add(item.getId());
        Ad ad = mongoTemplate.save(new Ad(ownerId, item, 2, sale, trade,
                price == null ? null : new BigDecimal(price), Instant.now()));
        adIds.add(ad.getId());
        return ad;
    }

    private Ad ad(String cardId) {
        return ad(cardId, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE, true, true, "10.00");
    }

    private MarketplaceFilters filters(String search, CardGame game, String modality,
                                       String edition, String rarity,
                                       CardCondition condition, CardLanguage language,
                                       String minPrice, String maxPrice) {
        return new MarketplaceFilters(search, game, modality, edition, rarity, condition, language,
                minPrice == null ? null : new BigDecimal(minPrice),
                maxPrice == null ? null : new BigDecimal(maxPrice));
    }

    private MarketplaceFilters byName(String search) {
        return new MarketplaceFilters(search + " " + token, null, null);
    }

    private List<String> ids(MarketplaceFilters filters) {
        return repository.findAvailableAds(filters, PageRequest.of(0, 100, Sort.by("createdAt", "id")))
                .getContent().stream().map(Ad::getId).toList();
    }

    private List<String> ownIds(MarketplaceFilters filters) {
        return ids(filters).stream().filter(adIds::contains).toList();
    }

    @Test
    void shouldFilterByEditionAndRarityOnCard() {
        Ad base = ad(card("Pikachu", CardGame.POKEMON, "Base Set " + token, "Rare Holo"));
        Ad jungle = ad(card("Pikachu", CardGame.POKEMON, "Jungle " + token, "Common"));

        assertEquals(List.of(base.getId()),
                ownIds(filters(null, null, null, "base set " + token, null, null, null, null, null)));
        assertEquals(List.of(jungle.getId()),
                ownIds(filters("Pikachu " + token, null, null, null, "common", null, null, null, null)));
        assertTrue(ownIds(filters("Pikachu " + token, null, null, null, "Rare", null, null, null, null)).isEmpty());
    }

    @Test
    void shouldFilterByConditionAndLanguageOnAd() {
        String cardId = card("Charizard", CardGame.POKEMON, "Base", "Rare");
        Ad nearMint = ad(cardId, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE, true, false, "10.00");
        Ad damaged = ad(cardId, CardCondition.DAMAGED, CardLanguage.JAPANESE, true, false, "10.00");

        assertEquals(List.of(damaged.getId()),
                ownIds(filters(null, null, null, null, null, CardCondition.DAMAGED, null, null, null)));
        assertEquals(List.of(nearMint.getId()),
                ownIds(filters(null, null, null, null, null, null, CardLanguage.PORTUGUESE, null, null)));
    }

    @Test
    void shouldFilterPriceRangeOnlyAmongSaleAds() {
        String cardId = card("Mewtwo", CardGame.POKEMON, "Base", "Rare");
        ad(cardId, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, true, false, "5.00");
        Ad mid = ad(cardId, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, true, true, "20.00");
        ad(cardId, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, true, false, "50.00");
        ad(cardId, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, false, true, null);

        assertEquals(List.of(mid.getId()),
                ownIds(filters(null, null, null, null, null, null, null, "10.00", "30.00")));
        assertEquals(3,
                ownIds(filters(null, null, null, null, null, null, null, "0.00", null)).size());
    }

    @Test
    void shouldCombineFilters() {
        String pokemon = card("Dragon", CardGame.POKEMON, "Set A", "Rare");
        String yugioh = card("Dragon", CardGame.YUGIOH, "Set A", "Rare");
        Ad match = ad(yugioh, CardCondition.LIGHTLY_PLAYED, CardLanguage.ENGLISH, true, true, "15.00");
        ad(pokemon, CardCondition.LIGHTLY_PLAYED, CardLanguage.ENGLISH, true, true, "15.00");
        ad(yugioh, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, true, true, "15.00");
        ad(yugioh, CardCondition.LIGHTLY_PLAYED, CardLanguage.ENGLISH, false, true, null);
        ad(yugioh, CardCondition.LIGHTLY_PLAYED, CardLanguage.ENGLISH, true, true, "40.00");

        assertEquals(List.of(match.getId()), ownIds(filters(
                "Dragon " + token, CardGame.YUGIOH, "BOTH", "set a", "rare",
                CardCondition.LIGHTLY_PLAYED, CardLanguage.ENGLISH, "10.00", "20.00")));
    }

    @Test
    void shouldExcludeUnavailableAds() {
        String cardId = card("Blastoise", CardGame.POKEMON, "Base", "Rare");
        Ad available = ad(cardId);
        Ad partiallyHeld = ad(cardId);
        Ad fullyHeld = ad(cardId);
        Ad cancelled = ad(cardId);
        Ad soldOut = ad(cardId);

        ReflectionTestUtils.setField(partiallyHeld, "purchaseHolds",
                List.of(new AdPurchaseHold("order-1", 1, Instant.now())));
        ReflectionTestUtils.setField(fullyHeld, "purchaseHolds",
                List.of(new AdPurchaseHold("order-2", 2, Instant.now())));
        ReflectionTestUtils.setField(cancelled, "status", AdStatus.CANCELLED);
        ReflectionTestUtils.setField(soldOut, "status", AdStatus.SOLD_OUT);
        ReflectionTestUtils.setField(soldOut, "remainingQuantity", 0);
        List.of(partiallyHeld, fullyHeld, cancelled, soldOut).forEach(mongoTemplate::save);

        assertEquals(List.of(available.getId(), partiallyHeld.getId()), ownIds(byName("Blastoise")));
    }

    @Test
    void shouldPaginateFilteredResults() {
        String cardId = card("Eevee", CardGame.POKEMON, "Base", "Common");
        for (int i = 0; i < 5; i++) ad(cardId);

        Page<Ad> page = repository.findAvailableAds(byName("Eevee"),
                PageRequest.of(1, 2, Sort.by("createdAt", "id")));

        assertEquals(5, page.getTotalElements());
        assertEquals(3, page.getTotalPages());
        assertEquals(2, page.getContent().size());
        assertEquals(adIds.subList(2, 4), page.getContent().stream().map(Ad::getId).toList());
    }

    @Test
    void shouldReturnEmptyPageWhenNothingMatches() {
        ad(card("Snorlax", CardGame.POKEMON, "Base", "Rare"));

        Page<Ad> page = repository.findAvailableAds(
                filters("Snorlax " + token, CardGame.YUGIOH, null, null, null, null, null, null, null),
                PageRequest.of(0, 10, Sort.by("createdAt", "id")));

        assertTrue(page.isEmpty());
        assertEquals(0, page.getTotalElements());
    }
}
