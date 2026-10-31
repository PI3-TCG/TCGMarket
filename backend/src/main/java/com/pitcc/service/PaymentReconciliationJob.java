package com.pitcc.service;

import com.pitcc.integration.payment.PaymentProperties;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentStatus;
import com.pitcc.repository.PaymentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/** Consulta pagamentos pendentes antigos, para quando o webhook não chega. */
@Component
@ConditionalOnProperty(name = "payment.reconciliation.enabled", havingValue = "true", matchIfMissing = true)
public class PaymentReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationJob.class);
    private static final Duration DEFAULT_PENDING_AFTER = Duration.ofMinutes(2);

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final Duration pendingAfter;

    public PaymentReconciliationJob(
            PaymentRepository paymentRepository,
            PaymentService paymentService,
            PaymentProperties properties
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
        Duration configured = properties.reconciliation() == null
                ? null
                : properties.reconciliation().pendingAfter();
        this.pendingAfter = configured == null ? DEFAULT_PENDING_AFTER : configured;
    }

    @Scheduled(
            initialDelayString = "${payment.reconciliation.interval:1m}",
            fixedDelayString = "${payment.reconciliation.interval:1m}"
    )
    public void reconcilePending() {
        Instant cutoff = Instant.now().minus(pendingAfter);

        for (Payment payment : paymentRepository.findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, cutoff)) {
            try {
                paymentService.reconcile(payment);
            } catch (RuntimeException exception) {
                log.warn("Falha ao reconciliar o pagamento {}: {}", payment.getId(), exception.getMessage());
            }
        }
    }
}
