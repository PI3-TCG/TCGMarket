package com.pitcc.dto;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
    Instant timestamp, int status, String error, String message, List<FieldErrorResponse> fields) {

  public record FieldErrorResponse(String field, String message) {}
}
