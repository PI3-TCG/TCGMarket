package com.pitcc.controller;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CreateAdRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CreateAdService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/ads")
public class CreateAdController {

    private final CreateAdService createAdService;

    public CreateAdController(CreateAdService createAdService) {
        this.createAdService = createAdService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdResponse createAd(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody CreateAdRequest request
    ) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        return createAdService.createAd(current.id(), request);
    }
}
