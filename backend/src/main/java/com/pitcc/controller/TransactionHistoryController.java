package com.pitcc.controller;

import com.pitcc.dto.TransactionHistoryResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.TransactionHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/transactions")
public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;

    public TransactionHistoryController(TransactionHistoryService transactionHistoryService) {
        this.transactionHistoryService = transactionHistoryService;
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

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
