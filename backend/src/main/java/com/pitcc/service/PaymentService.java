package com.pitcc.service;

import com.pitcc.integration.payment.PaymentGateway;
import com.pitcc.integration.payment.PaymentGateway.PaymentRequest;
import com.pitcc.integration.payment.PaymentGatewayException;
import com.pitcc.model.Order;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentMethod;
import com.pitcc.model.User;
import com.pitcc.repository.PaymentRepository;
import com.pitcc.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Cria a cobrança de cada pedido e consulta o gateway depois. Falha técnica
 * não é recusa: o pagamento fica pendente e a reconciliação tenta de novo
 * com a mesma chave de idempotência, sem duplicar a cobrança.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentGateway gateway;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentResultService resultService;

    public PaymentService(
            PaymentGateway gateway,
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            PaymentResultService resultService
    ) {
        this.gateway = gateway;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.resultService = resultService;
    }

    public void startPayments(String buyerId, List<Order> orders) {
        String payerEmail = payerEmail(buyerId);

        for (Order order : orders) {
            Payment payment;
            try {
                payment = paymentRepository.save(
                        new Payment(order, gateway.provider(), PaymentMethod.PIX, Instant.now())
                );
            } catch (DuplicateKeyException alreadyStarted) {
                continue;
            }
            submit(payment, payerEmail);
        }
    }

    /** Consulta o gateway para um pagamento pendente. */
    public void reconcile(Payment payment) {
        if (payment.getProvider() != gateway.provider()) {
            return;
        }

        if (payment.getProviderPaymentId() == null) {
            submit(payment, payerEmail(payment.getBuyerId()));
            return;
        }

        try {
            resultService.apply(payment, gateway.fetch(payment.getProviderPaymentId()));
        } catch (PaymentGatewayException exception) {
            log.warn("Não foi possível consultar o pagamento {}: {}", payment.getId(), exception.getMessage());
        }
    }

    /** Notificação do provedor: o corpo é só um sinal, o status vem da consulta. */
    public void handleNotification(String providerPaymentId) {
        paymentRepository.findByProviderPaymentId(providerPaymentId)
                .ifPresentOrElse(
                        this::reconcile,
                        () -> log.info("Notificação para cobrança desconhecida {}.", providerPaymentId)
                );
    }

    private void submit(Payment payment, String payerEmail) {
        PaymentRequest request = new PaymentRequest(
                payment.getIdempotencyKey(),
                payment.getOrderId(),
                payment.getAmount(),
                payerEmail
        );

        try {
            resultService.apply(payment, gateway.create(request));
        } catch (PaymentGatewayException exception) {
            log.warn("Pagamento {} continua pendente: {}", payment.getId(), exception.getMessage());
        }
    }

    private String payerEmail(String buyerId) {
        return userRepository.findById(buyerId).map(User::getEmail).orElse(null);
    }
}
