package com.pitcc.service;

import com.pitcc.dto.CreateReviewRequest;
import com.pitcc.dto.TransactionReviewsResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.ReviewConflictException;
import com.pitcc.exception.TransactionNotFoundException;
import com.pitcc.model.Order;
import com.pitcc.model.Review;
import com.pitcc.model.Transaction;
import com.pitcc.repository.ReviewRepository;
import com.pitcc.repository.TransactionRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    private static final String TX = "tx-1";

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ReviewService service;

    @Test
    void buyerReviewsSellerWithGradeAndComment() {
        Transaction transaction = transaction();
        String buyer = transaction.getBuyerId();
        when(transactionRepository.findById(TX)).thenReturn(Optional.of(transaction));
        when(reviewRepository.findByTransactionId(TX)).thenAnswer(invocation -> List.of(
                saved(Review.of(transaction, buyer, 4, "Ótimo vendedor", Instant.now()))));

        TransactionReviewsResponse response =
                service.create(buyer, TX, new CreateReviewRequest(4, "  Ótimo vendedor  "));

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        Review review = captor.getValue();
        assertEquals(TX, review.getTransactionId());
        assertEquals(buyer, review.getReviewerId());
        assertEquals(transaction.getSellerId(), review.getRevieweeId());
        assertEquals(4, review.getGrade());
        assertEquals("Ótimo vendedor", review.getComment());
        assertNotNull(review.getReviewDate());

        assertEquals(4, response.given().grade());
        assertNull(response.received());
    }

    @Test
    void sellerReviewsBuyerAndBlankCommentIsDropped() {
        Transaction transaction = transaction();
        when(transactionRepository.findById(TX)).thenReturn(Optional.of(transaction));
        when(reviewRepository.findByTransactionId(TX)).thenReturn(List.of());

        service.create(transaction.getSellerId(), TX, new CreateReviewRequest(5, "   "));

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertEquals(transaction.getBuyerId(), captor.getValue().getRevieweeId());
        assertNull(captor.getValue().getComment());
    }

    @Test
    void nonParticipantSeesTransactionAsNotFound() {
        when(transactionRepository.findById(TX)).thenReturn(Optional.of(transaction()));

        assertThrows(TransactionNotFoundException.class,
                () -> service.create("intruder", TX, new CreateReviewRequest(5, null)));
        assertThrows(TransactionNotFoundException.class,
                () -> service.findForTransaction("intruder", TX));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void duplicateReviewIsConflict() {
        Transaction transaction = transaction();
        when(transactionRepository.findById(TX)).thenReturn(Optional.of(transaction));
        when(reviewRepository.save(any())).thenThrow(new DuplicateKeyException("dup"));

        assertThrows(ReviewConflictException.class,
                () -> service.create(transaction.getBuyerId(), TX, new CreateReviewRequest(3, null)));
    }

    @Test
    void anonymousUserIsRejected() {
        assertThrows(InvalidAuthenticationException.class,
                () -> service.findForTransaction(null, TX));
    }

    @Test
    void separatesGivenAndReceivedReviews() {
        Transaction transaction = transaction();
        String buyer = transaction.getBuyerId();
        when(transactionRepository.findById(TX)).thenReturn(Optional.of(transaction));
        when(reviewRepository.findByTransactionId(TX)).thenReturn(List.of(
                saved(Review.of(transaction, transaction.getSellerId(), 2, "Demorou", Instant.now())),
                saved(Review.of(transaction, buyer, 5, null, Instant.now()))));

        TransactionReviewsResponse response = service.findForTransaction(buyer, TX);

        assertEquals(5, response.given().grade());
        assertEquals(2, response.received().grade());
        assertEquals("Demorou", response.received().comment());
    }

    @Test
    void modelRejectsInvalidGradeAndLongComment() {
        Transaction transaction = transaction();
        String buyer = transaction.getBuyerId();

        assertThrows(IllegalArgumentException.class,
                () -> Review.of(transaction, buyer, 0, null, Instant.now()));
        assertThrows(IllegalArgumentException.class,
                () -> Review.of(transaction, buyer, 6, null, Instant.now()));
        assertThrows(IllegalArgumentException.class,
                () -> Review.of(transaction, buyer, 5, "a".repeat(501), Instant.now()));
        assertDoesNotThrow(() -> Review.of(transaction, buyer, 5, "a".repeat(500), Instant.now()));
    }

    private static Transaction transaction() {
        Order order = PaymentFixtures.order("order-1");
        order.markPaid(Instant.now());
        Transaction transaction = Transaction.fromPaidOrder(order, Instant.now());
        ReflectionTestUtils.setField(transaction, "id", TX);
        return transaction;
    }

    private static Review saved(Review review) {
        ReflectionTestUtils.setField(review, "id", "review-" + review.getReviewerId());
        return review;
    }
}
