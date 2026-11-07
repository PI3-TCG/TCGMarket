
package com.pitcc.exception;

import com.pitcc.dto.ApiErrorResponse;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TradeProposalDecisionExceptionHandler {

    @ExceptionHandler(TradeProposalConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(
            TradeProposalConflictException exception
    ) {
        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        exception.getMessage(),
                        List.of()
                ));
    }
}
