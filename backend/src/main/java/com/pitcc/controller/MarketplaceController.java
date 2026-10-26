package com.pitcc.controller;

import com.pitcc.dto.MarketplaceAdResponse;
import com.pitcc.dto.MarketplaceFilters;
import com.pitcc.dto.MarketplacePageResponse;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.MarketplaceService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(
            MarketplaceService marketplaceService
    ) {
        this.marketplaceService = marketplaceService;
    }

    // Rotas públicas: o usuário só existe quando a requisição traz um token válido.
    @GetMapping("/ads")
    public MarketplacePageResponse listAvailableAds(
            @AuthenticationPrincipal AuthenticatedUser current,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "recent") String sort,
            @Valid @ModelAttribute MarketplaceFilters filters
    ) {
        return marketplaceService.listAvailableAds(
                page,
                sort,
                filters,
                viewerId(current)
        );
    }

    @GetMapping("/ads/{id}")
    public MarketplaceAdResponse getAvailableAd(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String id
    ) {
        return marketplaceService.getAvailableAd(id, viewerId(current));
    }

    private static String viewerId(AuthenticatedUser current) {
        return current == null ? null : current.id();
    }
}
