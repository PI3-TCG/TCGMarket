package com.pitcc.service;

import com.pitcc.dto.CreateReviewRequest;
import com.pitcc.dto.TransactionReviewsResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.ReviewConflictException;
import com.pitcc.exception.TransactionNotFoundException;
import com.pitcc.model.Review;
import com.pitcc.model.Transaction;
import com.pitcc.repository.ReviewRepository;
import com.pitcc.repository.TransactionRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Avaliações entre participantes de transações concluídas. O avaliado é sempre
 * derivado da transação, nunca informado pelo cliente.
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            TransactionRepository transactionRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.transactionRepository = transactionRepository;
    }

    public TransactionReviewsResponse create(
            String userId,
            String transactionId,
            CreateReviewRequest request
    ) {
        Transaction transaction = findOwnTransaction(userId, transactionId);

        Review review = Review.of(
                transaction,
                userId,
                request.grade(),
                request.comment(),
                Instant.now()
        );
        try {
            reviewRepository.save(review);
        } catch (DuplicateKeyException exception) {
            throw new ReviewConflictException();
        }

        return toResponse(reviewRepository.findByTransactionId(transaction.getId()), userId);
    }

    public TransactionReviewsResponse findForTransaction(String userId, String transactionId) {
        Transaction transaction = findOwnTransaction(userId, transactionId);
        return toResponse(reviewRepository.findByTransactionId(transaction.getId()), userId);
    }

    // Transação de terceiros responde como inexistente para não revelar que existe.
    private Transaction findOwnTransaction(String userId, String transactionId) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }
        return transactionRepository.findById(transactionId)
                .filter(found -> userId.equals(found.getBuyerId())
                        || userId.equals(found.getSellerId()))
                .orElseThrow(TransactionNotFoundException::new);
    }

    private static TransactionReviewsResponse toResponse(List<Review> reviews, String userId) {
        TransactionReviewsResponse.Review given = null;
        TransactionReviewsResponse.Review received = null;
        for (Review review : reviews) {
            if (userId.equals(review.getReviewerId())) {
                given = toItem(review);
            } else if (userId.equals(review.getRevieweeId())) {
                received = toItem(review);
            }
        }
        return new TransactionReviewsResponse(given, received);
    }

    private static TransactionReviewsResponse.Review toItem(Review review) {
        return new TransactionReviewsResponse.Review(
                review.getId(),
                review.getGrade(),
                review.getComment(),
                review.getReviewDate()
        );
    }
}
