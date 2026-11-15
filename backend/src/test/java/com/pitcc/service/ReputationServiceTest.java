package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.pitcc.repository.UserRepository;
import com.pitcc.repository.TransactionRepository;
import com.pitcc.service.ReputationService.RatingCount;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

class ReputationServiceTest {
    @Test
    void separatesSellersAndComputesWeightedAverageAndEmptyState() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        var service = new ReputationService(mongo, mock(UserRepository.class), mock(TransactionRepository.class));
        when(mongo.aggregate(any(Aggregation.class), eq("reviews"), eq(RatingCount.class)))
                .thenReturn(new AggregationResults<>(List.of(
                        new RatingCount("seller-a", 5, 2),
                        new RatingCount("seller-a", 2, 1),
                        new RatingCount("seller-b", 3, 1)
                ), new Document()));

        var summaries = service.summaries(List.of("seller-a", "seller-b", "new-user"));
        assertEquals(4.0, summaries.get("seller-a").average());
        assertEquals(3L, summaries.get("seller-a").totalReviews());
        assertEquals(2L, summaries.get("seller-a").countsByRating().get(5));
        assertEquals(0L, summaries.get("seller-a").countsByRating().get(1));
        assertEquals(3.0, summaries.get("seller-b").average());
        assertNull(summaries.get("new-user").average());
        assertEquals(0L, summaries.get("new-user").totalReviews());
    }
}
