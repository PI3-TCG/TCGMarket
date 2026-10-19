package com.pitcc.controller;

import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.RemoveCollectionItemService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/collection")
public class RemoveCollectionItemController {

    private final RemoveCollectionItemService removeCollectionItemService;

    public RemoveCollectionItemController(
            RemoveCollectionItemService removeCollectionItemService
    ) {
        this.removeCollectionItemService = removeCollectionItemService;
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCollectionItem(
            @AuthenticationPrincipal AuthenticatedUser current,
            @PathVariable String itemId
    ) {
        if (current == null) {
            throw new InvalidAuthenticationException();
        }

        removeCollectionItemService.removeCollectionItem(current.id(), itemId);
    }
}
