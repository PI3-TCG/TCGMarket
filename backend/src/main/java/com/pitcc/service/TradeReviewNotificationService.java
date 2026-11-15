package com.pitcc.service;

import com.pitcc.model.Review;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.repository.TradeProposalRepository;
import java.time.Instant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class TradeReviewNotificationService {
    private final MongoTemplate mongo;

    private final TradeProposalRepository proposals;

    public TradeReviewNotificationService(MongoTemplate mongo, TradeProposalRepository proposals) {
        this.mongo = mongo;
        this.proposals = proposals;
    }

    public record ProposalNotification(String proposalId, Instant createdAt) {}

    public record TradeNotifications(List<ProposalNotification> proposals, List<Notification> reviews) {}

    public TradeNotifications pendingForUser(String userId) {
        var pendingProposals = proposals.findByRecipientIdAndStatus(
                userId, TradeProposalStatus.PENDING,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt", "id")));
        return new TradeNotifications(pendingProposals.stream()
                .map(proposal -> new ProposalNotification(proposal.getId(), proposal.getCreatedAt()))
                .toList(), pendingForProposer(userId));
    }

    public record Notification(String transactionId, Instant completedAt) {}

    public List<Notification> pendingForProposer(String proposerId) {
        var pipeline = List.of(
                new Document("$match", new Document("proposerId", proposerId)
                        .append("status", TradeProposalStatus.COMPLETED.name())
                        .append("transactionId", new Document("$type", "string").append("$ne", ""))),
                new Document("$sort", new Document("completedAt", -1).append("_id", -1)),
                new Document("$lookup", new Document("from", mongo.getCollectionName(Review.class))
                        .append("localField", "transactionId")
                        .append("foreignField", "transactionId")
                        .append("pipeline", List.of(
                                new Document("$match", new Document("reviewerId", proposerId)),
                                new Document("$limit", 1)))
                        .append("as", "givenReview")),
                new Document("$match", new Document("givenReview.0", new Document("$exists", false))),
                new Document("$limit", 20),
                new Document("$project", new Document("_id", 0)
                        .append("transactionId", 1).append("completedAt", 1))
        );
        return mongo.getCollection(mongo.getCollectionName(TradeProposal.class))
                .aggregate(pipeline)
                .map(row -> new Notification(row.getString("transactionId"),
                        row.getDate("completedAt") == null ? null : row.getDate("completedAt").toInstant()))
                .into(new java.util.ArrayList<>());
    }
}
