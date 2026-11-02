package com.pitcc.controller;

import com.pitcc.dto.CreateTradeProposalRequest;
import com.pitcc.dto.TradeProposalResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CreateTradeProposalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trade-proposals")
public class TradeProposalController {
    private final CreateTradeProposalService service;

    public TradeProposalController(CreateTradeProposalService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TradeProposalResponse create(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody CreateTradeProposalRequest request
    ) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return service.create(current.id(), request);
    }
}
