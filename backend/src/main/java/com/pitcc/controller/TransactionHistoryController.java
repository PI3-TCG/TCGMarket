package com.pitcc.controller;

import com.pitcc.dto.CreateReviewRequest;
import com.pitcc.dto.TransactionHistoryResponse;
import com.pitcc.dto.TransactionReviewsResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.ReviewService;
import com.pitcc.service.TransactionHistoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/transactions")
public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;
    private final ReviewService reviewService;

    public TransactionHistoryController(
            TransactionHistoryService transactionHistoryService,
            ReviewService reviewService) {
        this.transactionHistoryService = transactionHistoryService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public Page<TransactionHistoryResponse> findOwnTransactions(
            @AuthenticationPrincipal AuthenticatedUser current,
            @RequestParam(name = "type", required = false) TransactionHistoryResponse.Type type,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return transactionHistoryService.findOwnTransactions(userId(current), type, page, size);
    }

    @GetMapping("/{transactionId}")
    public TransactionHistoryResponse findOwnTransaction(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String transactionId) {
        return transactionHistoryService.findOwnTransaction(userId(current), transactionId);
    }

    @GetMapping("/{transactionId}/review")
    public TransactionReviewsResponse findReviews(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String transactionId) {
        return reviewService.findForTransaction(userId(current), transactionId);
    }

    @PostMapping("/{transactionId}/review")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionReviewsResponse createReview(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String transactionId,
            @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(userId(current), transactionId, request);
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
