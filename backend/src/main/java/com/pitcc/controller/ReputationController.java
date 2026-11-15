package com.pitcc.controller;

import com.pitcc.service.ReputationService;
import com.pitcc.service.ReputationService.ProfileReputation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReputationController {
    private final ReputationService reputation;

    public ReputationController(ReputationService reputation) {
        this.reputation = reputation;
    }

    @GetMapping("/api/users/{username}/reputation")
    public ProfileReputation reputation(@PathVariable String username, @RequestParam(defaultValue = "1") int page) {
        return reputation.forProfile(username, page);
    }
}
