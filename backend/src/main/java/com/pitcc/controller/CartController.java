package com.pitcc.controller;

import com.pitcc.dto.AddCartItemRequest;
import com.pitcc.dto.CartResponse;
import com.pitcc.dto.UpdateCartItemRequest;
import com.pitcc.dto.UpdateCartSelectionRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal AuthenticatedUser current) {
        return cartService.getCart(userId(current));
    }

    @PostMapping("/items")
    public CartResponse addItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(userId(current), request.adId(), request.quantity());
    }

    @PatchMapping("/items/{adId}")
    public CartResponse updateItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String adId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(userId(current), adId, request);
    }

    @DeleteMapping("/items/{adId}")
    public CartResponse removeItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String adId) {
        return cartService.removeItem(userId(current), adId);
    }

    @PutMapping("/selection")
    public CartResponse updateSelection(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody UpdateCartSelectionRequest request) {
        return cartService.updateSelection(userId(current), request.selected());
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
