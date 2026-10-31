package com.pitcc.controller;

import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CheckoutValidationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/checkout")
public class CheckoutController {

    private final CheckoutValidationService validationService;

    public CheckoutController(CheckoutValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping("/validate")
    public CheckoutValidationResponse validate(@AuthenticationPrincipal AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return validationService.validate(current.id());
    }
}
