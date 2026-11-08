package com.pitcc.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Avaliação que um participante faz do outro após uma transação concluída.
 *
 * <p>Cada participante avalia a transação uma única vez: o índice único em
 * transação + avaliador impede duplicidade mesmo com envios simultâneos.
 */
@Document(collection = "reviews")
@CompoundIndexes({
        @CompoundIndex(
                name = "uk_reviews_transaction_reviewer",
                def = "{'transactionId': 1, 'reviewerId': 1}",
                unique = true
        )
})
public class Review {

    public static final int MIN_GRADE = 1;
    public static final int MAX_GRADE = 5;
    public static final int MAX_COMMENT_LENGTH = 500;

    @Id
    private String id;

    private String transactionId;

    private String reviewerId;

    @Indexed(name = "reviews_reviewee")
    private String revieweeId;

    private int grade;

    private String comment;

    private Instant reviewDate;

    protected Review() {
    }

    public static Review of(
            Transaction transaction,
            String reviewerId,
            int grade,
            String comment,
            Instant now
    ) {
        if (transaction == null || transaction.getId() == null) {
            throw new IllegalArgumentException("A avaliação precisa de uma transação salva.");
        }
        boolean buyer = reviewerId != null && reviewerId.equals(transaction.getBuyerId());
        boolean seller = reviewerId != null && reviewerId.equals(transaction.getSellerId());
        if (!buyer && !seller) {
            throw new IllegalArgumentException("Só participantes da transação podem avaliar.");
        }
        if (grade < MIN_GRADE || grade > MAX_GRADE) {
            throw new IllegalArgumentException("A nota deve estar entre 1 e 5.");
        }
        String normalized = comment == null || comment.isBlank() ? null : comment.strip();
        if (normalized != null && normalized.length() > MAX_COMMENT_LENGTH) {
            throw new IllegalArgumentException("O comentário deve ter no máximo 500 caracteres.");
        }

        Review review = new Review();
        review.transactionId = transaction.getId();
        review.reviewerId = reviewerId;
        review.revieweeId = buyer ? transaction.getSellerId() : transaction.getBuyerId();
        review.grade = grade;
        review.comment = normalized;
        review.reviewDate = now;
        return review;
    }

    public String getId() {
        return id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getReviewerId() {
        return reviewerId;
    }

    public String getRevieweeId() {
        return revieweeId;
    }

    public int getGrade() {
        return grade;
    }

    public String getComment() {
        return comment;
    }

    public Instant getReviewDate() {
        return reviewDate;
    }
}
