package com.pitcc.integration.payment;

import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;

import java.math.BigDecimal;

/**
 * Cobrança no provedor de pagamento. Erros técnicos (rede, timeout, 5xx)
 * lançam {@link PaymentGatewayException}; recusa não é erro, vem no status.
 */
public interface PaymentGateway {

    PaymentProvider provider();

    /** Reenviar com a mesma {@code idempotencyKey} devolve a mesma cobrança. */
    GatewayPayment create(PaymentRequest request);

    /** Estado atual da cobrança; é a fonte da verdade para webhook e reconciliação. */
    GatewayPayment fetch(String providerPaymentId);

    record PaymentRequest(
            String idempotencyKey,
            String orderId,
            BigDecimal amount,
            String payerEmail
    ) {
    }

    record GatewayPayment(
            String providerPaymentId,
            PaymentStatus status,
            String statusDetail
    ) {
    }
}
