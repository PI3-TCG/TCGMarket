package com.pitcc.controller;

import com.pitcc.dto.CollectionFilters;
import com.pitcc.dto.CollectionItemResponse;
import com.pitcc.dto.CollectionSummaryResponse;
import com.pitcc.dto.CollectionFilterOptionsResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CollectionService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/collection")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public Page<CollectionItemResponse> findOwnCollection(
            @AuthenticationPrincipal AuthenticatedUser current,

            @RequestParam(name = "page", defaultValue = "0")
            int page,

            @RequestParam(name = "size", defaultValue = "20")
            int size,

            @RequestParam(name = "search", required = false)
            String search,

            @RequestParam(name = "game", required = false)
            CardGame game,

            @RequestParam(name = "edition", required = false)
            String edition,

            @RequestParam(name = "rarity", required = false)
            String rarity,

            @RequestParam(name = "condition", required = false)
            CardCondition condition,

            @RequestParam(name = "language", required = false)
            CardLanguage language) {

        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        CollectionFilters filters = new CollectionFilters(
                search,
                game,
                edition,
                rarity,
                condition,
                language
        );

        return collectionService.findOwnCollection(
                current.id(),
                page,
                size,
                filters
        );
    }

    @GetMapping("/summary")
    public CollectionSummaryResponse summarizeOwnCollection(
            @AuthenticationPrincipal AuthenticatedUser current) {

        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        return collectionService.summarizeOwnCollection(current.id());
    }

    @GetMapping("/{itemId}")
    public CollectionItemResponse findOwnItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String itemId) {

        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        return collectionService.findOwnItem(current.id(), itemId);
    }

    @GetMapping("/filter-options")
    public CollectionFilterOptionsResponse findOwnFilterOptions(
            @AuthenticationPrincipal AuthenticatedUser current) {

        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        return collectionService.findOwnFilterOptions(current.id());
    }
}