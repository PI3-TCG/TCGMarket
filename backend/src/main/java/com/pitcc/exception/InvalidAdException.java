package com.pitcc.exception;

public class InvalidAdException extends RuntimeException {

    private final String field;

    public InvalidAdException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
