package com.pitcc.exception;

public class ReviewConflictException extends RuntimeException {

    public ReviewConflictException() {
        super("Você já avaliou esta transação.");
    }
}
