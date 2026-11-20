package com.pitcc.service;

import com.pitcc.dto.AdminDashboardActivityResponse;
import com.pitcc.dto.AdminDashboardActivityResponse.DailyActivity;
import com.pitcc.dto.AdminDashboardOverviewResponse;
import com.pitcc.dto.AdminDashboardOverviewResponse.GameTotal;
import com.pitcc.dto.AdminDashboardOverviewResponse.Metric;
import com.pitcc.dto.AdminDashboardRecentAdResponse;
import com.pitcc.dto.AdminDashboardRecentUserResponse;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardGame;
import com.pitcc.model.Order;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.User;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

/** Consultas resumidas no MongoDB: jamais carrega todos os usuários, anúncios ou cartas. */
@Service
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardService {
  private static final ZoneId REPORT_ZONE = ZoneId.of("America/Sao_Paulo");
  private final MongoTemplate mongo;
  private final Clock clock;

  @Autowired
  public AdminDashboardService(MongoTemplate mongo) {
    this(mongo, Clock.systemUTC());
  }

  // Visível para testes determinísticos de calendário.
  AdminDashboardService(MongoTemplate mongo, Clock clock) {
    this.mongo = mongo;
    this.clock = clock;
  }

  public AdminDashboardOverviewResponse overview() {
    YearMonth month = YearMonth.from(ZonedDateTime.now(clock.withZone(REPORT_ZONE)));
    Instant currentStart = month.atDay(1).atStartOfDay(REPORT_ZONE).toInstant();
    Instant previousStart = month.minusMonths(1).atDay(1).atStartOfDay(REPORT_ZONE).toInstant();
    Instant nextStart = month.plusMonths(1).atDay(1).atStartOfDay(REPORT_ZONE).toInstant();

    long allUsers = mongo.count(new Query(), User.class);
    Metric users = metric(allUsers, countBetween(User.class, "registrationDate", currentStart, nextStart),
        countBetween(User.class, "registrationDate", previousStart, currentStart));

    List<GameTotal> games = countsByGame();
    long totalCards = games.stream().mapToLong(GameTotal::totalCards).sum();
    // Card não possui createdAt: não inferir datas a partir de ID/importação.
    Metric cards = new Metric(totalCards, null);

    long allAds = mongo.count(Query.query(Criteria.where("creationAborted").ne(true)), Ad.class);
    Metric ads = null;
    if (allAds > 0) {
      Criteria active = Criteria.where("status").is(AdStatus.ACTIVE)
          .and("remainingQuantity").gt(0)
          .and("creationAborted").ne(true);
      long activeCount = mongo.count(Query.query(active), Ad.class);
      // A data de criação não indica quantos anúncios estavam ativos no mês passado.
      // Sem snapshots históricos de status, a variação mensal é desconhecida.
      ads = new Metric(activeCount, null);
    }

    long allOrders = mongo.count(new Query(), Order.class);
    Metric sales = null;
    if (allOrders > 0) {
      Criteria completed = Criteria.where("status").is(OrderStatus.COMPLETED);
      long completedCount = mongo.count(Query.query(completed), Order.class);
      sales = metric(completedCount,
          countBetween(Order.class, "completedAt", currentStart, nextStart, completed),
          countBetween(Order.class, "completedAt", previousStart, currentStart, completed));
    }

    return new AdminDashboardOverviewResponse(users, cards, ads, sales, games);
  }

  public AdminDashboardActivityResponse activity(int days) {
    if (days != 7 && days != 30 && days != 90) {
      throw new IllegalArgumentException("Use 7, 30 ou 90 dias.");
    }
    LocalDate end = LocalDate.now(clock.withZone(REPORT_ZONE));
    LocalDate start = end.minusDays(days - 1L);
    Instant from = start.atStartOfDay(REPORT_ZONE).toInstant();
    Instant to = end.plusDays(1).atStartOfDay(REPORT_ZONE).toInstant();

    Map<LocalDate, Long> newUsers = countPerDay("users", "registrationDate", from, to, new Document());
    long allAds = mongo.count(Query.query(Criteria.where("creationAborted").ne(true)), Ad.class);
    boolean hasAdSeries = allAds > 0;
    Map<LocalDate, Long> newAds = hasAdSeries
        ? countPerDay("ads", "createdAt", from, to, new Document("creationAborted", new Document("$ne", true)))
        : Map.of();
    boolean hasSaleSeries = mongo.count(Query.query(Criteria.where("status").is(OrderStatus.COMPLETED)), Order.class) > 0;
    Map<LocalDate, Long> newSales = hasSaleSeries
        ? countPerDay("orders", "completedAt", from, to, new Document("status", OrderStatus.COMPLETED.name()))
        : Map.of();

    List<DailyActivity> data = new ArrayList<>(days);
    for (int i = 0; i < days; i++) {
      LocalDate date = start.plusDays(i);
      data.add(new DailyActivity(date, newUsers.getOrDefault(date, 0L),
          hasAdSeries ? newAds.getOrDefault(date, 0L) : null,
          hasSaleSeries ? newSales.getOrDefault(date, 0L) : null));
    }
    return new AdminDashboardActivityResponse(days, hasAdSeries, hasSaleSeries, data);
  }

  public List<AdminDashboardRecentUserResponse> recentUsers() {
    Query query = new Query().with(Sort.by(Sort.Direction.DESC, "registrationDate", "id")).limit(5);
    query.fields().include("name").include("username").include("role")
        .include("status").include("registrationDate");
    return mongo.find(query, User.class).stream()
        .map(AdminDashboardRecentUserResponse::from).toList();
  }

  public List<AdminDashboardRecentAdResponse> recentAds() {
    Query query = Query.query(Criteria.where("creationAborted").ne(true))
        .with(Sort.by(Sort.Direction.DESC, "createdAt", "id")).limit(5);
    List<Ad> ads = mongo.find(query, Ad.class);
    if (ads.isEmpty()) return List.of();

    // Um único batch de no máximo cinco cartas; nenhum N+1 nem leitura completa do catálogo.
    List<String> ids = ads.stream().map(Ad::getCardId).filter(id -> id != null).distinct().toList();
    Map<String, Card> cards = ids.isEmpty() ? Map.of()
        : mongo.find(Query.query(Criteria.where("id").in(ids)), Card.class).stream()
            .collect(Collectors.toMap(Card::getId, Function.identity()));

    return ads.stream().map(ad -> {
      Card card = cards.get(ad.getCardId());
      return new AdminDashboardRecentAdResponse(ad.getId(),
          card == null ? "Carta indisponível" : card.getName(),
          card == null ? null : card.getGame(),
          ad.isSaleEnabled() ? ad.getUnitPrice() : null,
          !ad.isSaleEnabled() && ad.isTradeEnabled(),
          ad.getStatus(), ad.getCreatedAt());
    }).toList();
  }

  /** Retorna null quando mês anterior não tem base; evita dividir por zero. */
  public static Double percentageChange(long currentMonth, long previousMonth) {
    return previousMonth == 0 ? null : 100.0 * (currentMonth - previousMonth) / previousMonth;
  }

  private static Metric metric(long total, long thisMonth, long lastMonth) {
    return new Metric(total, percentageChange(thisMonth, lastMonth));
  }

  private long countBetween(Class<?> type, String field, Instant start, Instant end) {
    return countBetween(type, field, start, end, null);
  }

  private long countBetween(Class<?> type, String field, Instant start, Instant end, Criteria extra) {
    Criteria period = Criteria.where(field).gte(start).lt(end);
    return mongo.count(Query.query(extra == null ? period : new Criteria().andOperator(period, extra)), type);
  }

  private List<GameTotal> countsByGame() {
    Map<CardGame, Long> counts = mongo.aggregate(
        Aggregation.newAggregation(Aggregation.group("game").count().as("total")),
        "cards", Document.class).getMappedResults().stream()
        .filter(row -> row.get("_id") instanceof String game &&
            Arrays.stream(CardGame.values()).anyMatch(value -> value.name().equals(game)))
        .collect(Collectors.toMap(
            row -> CardGame.valueOf(row.getString("_id")),
            row -> ((Number) row.get("total")).longValue()));
    return Arrays.stream(CardGame.values())
        .map(game -> new GameTotal(game, counts.getOrDefault(game, 0L))).toList();
  }

  private Map<LocalDate, Long> countPerDay(
      String collection, String field, Instant start, Instant end, Document extra) {
    Document match = new Document(extra);
    match.put(field, new Document("$gte", Date.from(start)).append("$lt", Date.from(end)));
    Document date = new Document("$dateToString",
        new Document("format", "%Y-%m-%d")
            .append("date", "$" + field).append("timezone", REPORT_ZONE.getId()));
    List<Document> pipeline = List.of(
        new Document("$match", match),
        new Document("$group", new Document("_id", date).append("total", new Document("$sum", 1))),
        new Document("$sort", new Document("_id", 1)));
    Map<LocalDate, Long> grouped = new HashMap<>();
    mongo.getCollection(collection).aggregate(pipeline).forEach(row ->
        grouped.put(LocalDate.parse(row.getString("_id")), ((Number) row.get("total")).longValue()));
    return grouped;
  }
}
