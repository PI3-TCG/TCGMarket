package com.pitcc.controller;

import com.pitcc.dto.CardCollectionCoverRequest;
import com.pitcc.dto.CardCollectionRequest;
import com.pitcc.dto.CardCollectionResponse;
import com.pitcc.dto.CardCollectionVisibilityRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CardCollectionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/collections")
public class CardCollectionController {

    private final CardCollectionService collectionService;

    public CardCollectionController(CardCollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public List<CardCollectionResponse> list(@AuthenticationPrincipal AuthenticatedUser current) {
        return collectionService.list(requireUser(current));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardCollectionResponse create(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody CardCollectionRequest request
    ) {
        return collectionService.create(requireUser(current), request.name());
    }

    @PatchMapping("/{collectionId}")
    public CardCollectionResponse rename(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String collectionId,
            @Valid @RequestBody CardCollectionRequest request
    ) {
        return collectionService.rename(requireUser(current), collectionId, request.name());
    }

    @PatchMapping("/{collectionId}/visibility")
    public CardCollectionResponse setVisible(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String collectionId,
            @Valid @RequestBody CardCollectionVisibilityRequest request
    ) {
        return collectionService.setVisible(requireUser(current), collectionId, request.visible());
    }

    @PatchMapping("/{collectionId}/cover")
    public CardCollectionResponse setCover(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String collectionId,
            @RequestBody CardCollectionCoverRequest request
    ) {
        String itemId = request == null ? null : request.itemId();
        return collectionService.setCover(requireUser(current), collectionId, itemId);
    }

    @DeleteMapping("/{collectionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String collectionId
    ) {
        collectionService.delete(requireUser(current), collectionId);
    }

    private static String requireUser(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
