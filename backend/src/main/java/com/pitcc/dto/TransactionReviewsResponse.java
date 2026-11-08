package com.pitcc.dto;

import java.time.Instant;

/**
 * Avaliações de uma transação vistas por um participante: a que ele fez e a
 * que recebeu da outra parte. Qualquer uma pode ainda não existir.
 */
public record TransactionReviewsResponse(Review given, Review received) {

    public record Review(String id, int grade, String comment, Instant reviewDate) {
    }
}
