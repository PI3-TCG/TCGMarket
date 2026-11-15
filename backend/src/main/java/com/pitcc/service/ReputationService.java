package com.pitcc.service;

import com.pitcc.dto.ReputationSummary;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.Review;
import com.pitcc.model.TransactionType;
import com.pitcc.repository.TransactionRepository;
import com.pitcc.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class ReputationService {

    private static final int PAGE_SIZE = 10;
    private final MongoTemplate mongo;
    private final UserRepository users;

    private final TransactionRepository transactions;

    public ReputationService(MongoTemplate mongo, UserRepository users, TransactionRepository transactions) {
        this.mongo = mongo;
        this.users = users;
        this.transactions = transactions;
    }

    public record RatingCount(String revieweeId, int grade, long count) {}
    public record ReviewItem(String id, String author, int rating, String comment, Instant createdAt, TransactionType transactionType) {}
    public record ProfileReputation(ReputationSummary summary, List<ReviewItem> reviews, boolean hasNext) {}

    public Map<String, ReputationSummary> summaries(List<String> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        var aggregation = Aggregation.newAggregation(
                Aggregation.match(validReceived(userIds)),
                Aggregation.group("revieweeId", "grade").count().as("count"),
                context -> new Document("$project", new Document("_id", 0)
                        .append("revieweeId", "$_id.revieweeId")
                        .append("grade", "$_id.grade")
                        .append("count", 1))
        );
        Map<String, Map<Integer, Long>> counts = new HashMap<>();
        for (RatingCount row : mongo.aggregate(aggregation, "reviews", RatingCount.class).getMappedResults()) {
            counts.computeIfAbsent(row.revieweeId(), key -> new HashMap<>()).put(row.grade(), row.count());
        }
        Map<String, ReputationSummary> summaries = new HashMap<>();
        userIds.forEach(id -> summaries.put(id, ReputationSummary.fromCounts(counts.getOrDefault(id, Map.of()))));
        return summaries;
    }

    public ProfileReputation forProfile(String username, int page) {
        if (page < 1) {
            throw new IllegalArgumentException("A página deve ser maior ou igual a 1.");
        }
        var user = users.findByUsername(username.trim().toLowerCase(Locale.ROOT))
                .filter(found -> !found.isSuspended())
                .orElseThrow(UserNotFoundException::new);
        List<String> userIds = List.of(user.getId());
        var query = Query.query(validReceived(userIds))
                .with(Sort.by(Sort.Order.desc("reviewDate"), Sort.Order.desc("id")))
                .skip((long) (page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE + 1);
        List<Review> rows = mongo.find(query, Review.class);
        List<Review> pageRows = rows.stream().limit(PAGE_SIZE).toList();
        Map<String, String> authors = new HashMap<>();
        users.findAllById(pageRows.stream().map(Review::getReviewerId).distinct().toList())
                .forEach(author -> {
                    if (!author.isSuspended() && author.getUsername() != null) {
                        authors.put(author.getId(), "@" + author.getUsername());
                    }
                });
        Map<String, TransactionType> transactionTypes = new HashMap<>();
        transactions.findAllById(pageRows.stream().map(Review::getTransactionId).distinct().toList())
                .forEach(transaction -> transactionTypes.put(transaction.getId(), transaction.getType()));
        List<ReviewItem> reviews = pageRows.stream().map(review -> new ReviewItem(
                review.getId(), authors.getOrDefault(review.getReviewerId(), "Usuário indisponível"),
                review.getGrade(), review.getComment(), review.getReviewDate(), transactionTypes.get(review.getTransactionId())
        )).toList();
        return new ProfileReputation(summaries(userIds).get(user.getId()), reviews, rows.size() > PAGE_SIZE);
    }

    private static Criteria validReceived(List<String> userIds) {
        return Criteria.where("revieweeId").in(userIds)
                .and("grade").in(1, 2, 3, 4, 5)
                .and("$expr").is(new Document("$ne", List.of("$reviewerId", "$revieweeId")));
    }
}
