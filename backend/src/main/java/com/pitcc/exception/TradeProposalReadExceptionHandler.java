package com.pitcc.exception;

import com.pitcc.dto.ApiErrorResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Mantem o formato de erros do projeto, sem alterar o handler compartilhado. */
@RestControllerAdvice
public class TradeProposalReadExceptionHandler {

    @ExceptionHandler(TradeProposalNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(TradeProposalNotFoundException ex) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), ex.getMessage(), List.of()));
    }
}
