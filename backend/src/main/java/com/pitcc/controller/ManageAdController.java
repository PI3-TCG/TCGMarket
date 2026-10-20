package com.pitcc.controller;

import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.AdModality;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardGame;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.ManageAdService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/ads")
public class ManageAdController {

    private final ManageAdService manageAdService;

    public ManageAdController(ManageAdService manageAdService) {
        this.manageAdService = manageAdService;
    }

    @GetMapping
    public Page<OwnAdResponse> findOwnAds(
            @AuthenticationPrincipal AuthenticatedUser current,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "game", required = false) CardGame game,
            @RequestParam(name = "modality", required = false) AdModality modality,
            @RequestParam(name = "status", required = false) AdStatus status) {

        return manageAdService.findOwnAds(
                userId(current),
                page,
                size,
                new OwnAdFilters(search, game, modality, status)
        );
    }

    @GetMapping("/{adId}")
    public OwnAdResponse findOwnAd(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String adId) {
        return manageAdService.findOwnAd(userId(current), adId);
    }

    @PatchMapping("/{adId}")
    public OwnAdResponse updateOwnAd(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String adId,
            @Valid @RequestBody UpdateAdRequest request) {
        return manageAdService.updateOwnAd(userId(current), adId, request);
    }

    @PostMapping("/{adId}/cancel")
    public OwnAdResponse cancelOwnAd(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String adId) {
        return manageAdService.cancelOwnAd(userId(current), adId);
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
