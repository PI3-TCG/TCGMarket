package com.pitcc.controller;

import com.pitcc.dto.TradeProposalViewResponse;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.service.TradeProposalReadService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints somente de leitura (issue #84).
 * Nao modifica o POST existente, nem permite aceitar, recusar ou cancelar.
 */
@RestController
public class TradeProposalReadController {
    private final TradeProposalReadService service;

    public TradeProposalReadController(TradeProposalReadService service) {
        this.service = service;
    }

    @GetMapping("/api/users/me/trade-proposals")
    public Page<TradeProposalViewResponse> list(
            @AuthenticationPrincipal AuthenticatedUser current,
            @RequestParam(name = "direction") String direction,
            @RequestParam(name = "status", required = false) TradeProposalStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return service.findOwnProposals(userId(current), direction, status, page, size);
    }

    @GetMapping("/api/trade-proposals/{id}")
    public TradeProposalViewResponse detail(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String id
    ) {
        return service.findOwnProposal(userId(current), id);
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) throw new InvalidAuthenticationException();
        return current.id();
    }
}
