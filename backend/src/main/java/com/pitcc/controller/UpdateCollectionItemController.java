
package com.pitcc.controller;

import com.pitcc.dto.UpdateCollectionItemRequest;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.UpdateCollectionItemService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/collection")
public class UpdateCollectionItemController {

    private final UpdateCollectionItemService updateCollectionItemService;

    public UpdateCollectionItemController(
            UpdateCollectionItemService updateCollectionItemService
    ) {
        this.updateCollectionItemService = updateCollectionItemService;
    }

    @PatchMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateCollectionItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String itemId,
            @Valid @RequestBody UpdateCollectionItemRequest request
    ) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        updateCollectionItemService.updateCollectionItem(
                current.id(),
                itemId,
                request
        );
    }
}
