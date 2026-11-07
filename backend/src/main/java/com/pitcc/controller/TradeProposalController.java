
package com.pitcc.controller;

import com.pitcc.dto.CreateTradeProposalRequest;
import com.pitcc.dto.TradeProposalResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CreateTradeProposalService;
import com.pitcc.service.TradeProposalDecisionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trade-proposals")
public class TradeProposalController {

    private final CreateTradeProposalService createService;
    private final TradeProposalDecisionService decisionService;

    public TradeProposalController(
            CreateTradeProposalService createService,
            TradeProposalDecisionService decisionService
    ) {
        this.createService = createService;
        this.decisionService = decisionService;
    }

    // Issue #83 - Criacao de propostas
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TradeProposalResponse create(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody CreateTradeProposalRequest request
    ) {
        return createService.create(
                userId(current),
                request
        );
    }

    // Issue #85 - Aceitar proposta
    @PatchMapping("/{id}/accept")
    public DecisionResponse accept(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String id
    ) {
        return new DecisionResponse(
                decisionService.accept(id, userId(current))
        );
    }

    // Issue #85 - Recusar proposta
    @PatchMapping("/{id}/reject")
    public DecisionResponse reject(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String id
    ) {
        return new DecisionResponse(
                decisionService.reject(id, userId(current))
        );
    }

    // Issue #85 - Cancelar proposta
    @PatchMapping("/{id}/cancel")
    public DecisionResponse cancel(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String id
    ) {
        return new DecisionResponse(
                decisionService.cancel(id, userId(current))
        );
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }

    public record DecisionResponse(
            TradeProposalStatus status
    ) {
    }
}
