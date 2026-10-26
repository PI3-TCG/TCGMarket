package com.pitcc.controller;

import com.pitcc.dto.AddressRequest;
import com.pitcc.dto.AddressResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public List<AddressResponse> list(@AuthenticationPrincipal AuthenticatedUser current) {
        return addressService.list(userId(current));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse create(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody AddressRequest request) {
        return addressService.create(userId(current), request);
    }

    @PutMapping("/{addressId}")
    public AddressResponse update(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequest request) {
        return addressService.update(userId(current), addressId, request);
    }

    private static String userId(AuthenticatedUser current) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }
        return current.id();
    }
}
