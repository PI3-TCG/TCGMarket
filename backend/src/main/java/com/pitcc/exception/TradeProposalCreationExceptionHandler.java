package com.pitcc.exception;

import com.pitcc.dto.ApiErrorResponse;
import com.pitcc.dto.ApiErrorResponse.FieldErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

/** Resposta no mesmo formato de erros usado pelas APIs existentes. */
@RestControllerAdvice
public class TradeProposalCreationExceptionHandler {

    @ExceptionHandler(TradeProposalCreationException.class)
    public ResponseEntity<ApiErrorResponse> handle(TradeProposalCreationException exception) {
        var status = exception.getStatus();
        var fields = exception.getField() == null
                ? List.<FieldErrorResponse>of()
                : List.of(new FieldErrorResponse(exception.getField(), exception.getMessage()));

        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), exception.getMessage(), fields));
    }
}
