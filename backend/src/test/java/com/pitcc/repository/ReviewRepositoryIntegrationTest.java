package com.pitcc.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.pitcc.model.Review;
import com.pitcc.model.Transaction;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ReviewRepositoryIntegrationTest {

  @Autowired private ReviewRepository reviewRepository;

  private Transaction transaction;

  @BeforeEach
  void setUp() {
    String suffix = UUID.randomUUID().toString();
    transaction = mock(Transaction.class);
    when(transaction.getId()).thenReturn("review-tx-" + suffix);
    when(transaction.getBuyerId()).thenReturn("buyer-" + suffix);
    when(transaction.getSellerId()).thenReturn("seller-" + suffix);
  }

  @AfterEach
  void tearDown() {
    reviewRepository.deleteAll(reviewRepository.findByTransactionId(transaction.getId()));
  }

  @Test
  void sameParticipantCannotReviewTransactionTwice() {
    reviewRepository.save(review(transaction.getBuyerId(), 5));

    assertThrows(
        DuplicateKeyException.class,
        () -> reviewRepository.save(review(transaction.getBuyerId(), 1)));
  }

  @Test
  void bothParticipantsCanReviewTheSameTransaction() {
    reviewRepository.save(review(transaction.getBuyerId(), 5));
    reviewRepository.save(review(transaction.getSellerId(), 4));

    assertEquals(2, reviewRepository.findByTransactionId(transaction.getId()).size());
  }

  private Review review(String reviewerId, int grade) {
    return Review.of(transaction, reviewerId, grade, null, Instant.now());
  }
}
