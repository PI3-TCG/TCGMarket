package com.pitcc.controller;

import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.TradeReviewNotificationService;
import com.pitcc.service.TradeReviewNotificationService.Notification;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TradeReviewNotificationController {
    private final TradeReviewNotificationService notifications;

    public TradeReviewNotificationController(TradeReviewNotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping("/api/users/me/notifications/trades")
    public TradeReviewNotificationService.TradeNotifications listTrades(
            @AuthenticationPrincipal AuthenticatedUser current) {
        if (current == null) throw new InvalidAuthenticationException();
        return notifications.pendingForUser(current.id());
    }

    @GetMapping("/api/users/me/notifications/trade-reviews")
    public List<Notification> list(@AuthenticationPrincipal AuthenticatedUser current) {
        if (current == null) throw new InvalidAuthenticationException();
        return notifications.pendingForProposer(current.id());
    }
}
