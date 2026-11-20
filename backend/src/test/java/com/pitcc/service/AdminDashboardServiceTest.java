package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.pitcc.model.Ad;
import com.pitcc.model.CardGame;
import com.pitcc.model.Order;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Query;

class AdminDashboardServiceTest {
  @Test
  void noPreviousMonthProducesNoPercentage() {
    assertNull(AdminDashboardService.percentageChange(12, 0));
    assertEquals(25.0, AdminDashboardService.percentageChange(5, 4));
    assertEquals(-50.0, AdminDashboardService.percentageChange(2, 4));
  }

  @Test
  void dashboardNeverInventsAdsSalesOrCatalogGrowth() {
    MongoTemplate mongo = Mockito.mock(MongoTemplate.class);
    when(mongo.aggregate(any(Aggregation.class), eq("cards"), eq(Document.class)))
        .thenReturn(new AggregationResults<>(List.of(
            new Document("_id", "POKEMON").append("total", 7),
            new Document("_id", "YUGIOH").append("total", 3)),
            new Document()));
    when(mongo.count(any(Query.class), eq(Ad.class))).thenReturn(0L);
    when(mongo.count(any(Query.class), eq(Order.class))).thenReturn(0L);

    AdminDashboardService service = new AdminDashboardService(mongo,
        Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC));
    var overview = service.overview();
    assertEquals(10L, overview.catalogCards().value());
    assertNull(overview.catalogCards().monthlyChangePercent());
    assertNull(overview.activeAds());
    assertNull(overview.completedSales());
    assertEquals(List.of(CardGame.POKEMON, CardGame.YUGIOH, CardGame.MAGIC_THE_GATHERING),
        overview.distribution().stream().map(item -> item.game()).toList());
    assertEquals(0L, overview.distribution().get(2).totalCards());
  }
}
