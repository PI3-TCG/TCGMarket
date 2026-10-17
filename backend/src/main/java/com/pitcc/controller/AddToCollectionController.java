
package com.pitcc.controller;

import com.pitcc.dto.AddToCollectionRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.AddToCollectionService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/collection")
public class AddToCollectionController {

    // 1. Dependência do Service
    private final AddToCollectionService addToCollectionService;

    // 2. Injeção de dependência
    public AddToCollectionController(
            AddToCollectionService addToCollectionService) {

        this.addToCollectionService = addToCollectionService;
    }

    // 3. Endpoint para adicionar cartas
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addToCollection(
            @AuthenticationPrincipal AuthenticatedUser current,
            @Valid @RequestBody AddToCollectionRequest request) {

        // 4. Validar autenticação
        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        // 5. Delegar para o Service
        addToCollectionService.addToCollection(
                current.id(),
                request
        );
    }
}
