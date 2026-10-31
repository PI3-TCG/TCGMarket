package com.pitcc.controller;

import com.pitcc.dto.CheckoutOrdersResponse;
import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.PlaceOrderRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CheckoutValidationService;
import com.pitcc.service.PlaceOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/checkout")
public class CheckoutController {

    private final CheckoutValidationService validationService;
    private final PlaceOrderService placeOrderService;

    public CheckoutController(
            CheckoutValidationService validationService,
            PlaceOrderService placeOrderService
    ) {
        this.validationService = validationService;
        this.placeOrderService = placeOrderService;
    }

    @PostMapping("/validate")
    public CheckoutValidationResponse validate(@AuthenticationPrincipal AuthenticatedUser current) {
        return validationService.validate(requireUser(current));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckoutOrdersResponse placeOrder(
            @AuthenticationPrincipal AuthenticatedUser current,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        return placeOrderService.placeOrder(requireUser(current), idempotencyKey, request.addressId());
    }

    private static String requireUser(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
