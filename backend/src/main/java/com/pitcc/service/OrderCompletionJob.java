package com.pitcc.service;

import com.pitcc.model.Order;
import com.pitcc.model.OrderStatus;
import com.pitcc.repository.OrderRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/** Termina pedidos pagos que ficaram sem concluir (queda ou inconsistência). */
@Component
@ConditionalOnProperty(name = "payment.reconciliation.enabled", havingValue = "true", matchIfMissing = true)
public class OrderCompletionJob {

    private static final Duration STALE_AFTER = Duration.ofMinutes(1);

    private final OrderRepository orderRepository;
    private final OrderCompletionService completionService;

    public OrderCompletionJob(OrderRepository orderRepository, OrderCompletionService completionService) {
        this.orderRepository = orderRepository;
        this.completionService = completionService;
    }

    @Scheduled(
            initialDelayString = "${payment.reconciliation.interval:1m}",
            fixedDelayString = "${payment.reconciliation.interval:1m}"
    )
    public void completePaidOrders() {
        Instant cutoff = Instant.now().minus(STALE_AFTER);

        for (Order order : orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.PAID, cutoff)) {
            completionService.completeQuietly(order.getId());
        }
    }
}
