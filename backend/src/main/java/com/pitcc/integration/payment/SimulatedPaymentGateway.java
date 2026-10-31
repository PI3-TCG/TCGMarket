package com.pitcc.integration.payment;

import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;

/** Simulador sem rede: toda cobrança termina com o resultado configurado. */
public class SimulatedPaymentGateway implements PaymentGateway {

    private static final String ID_PREFIX = "sim-";

    private final PaymentStatus outcome;

    public SimulatedPaymentGateway(PaymentStatus outcome) {
        this.outcome = outcome == null ? PaymentStatus.APPROVED : outcome;
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.SIMULATED;
    }

    @Override
    public GatewayPayment create(PaymentRequest request) {
        return fetch(ID_PREFIX + request.idempotencyKey());
    }

    @Override
    public GatewayPayment fetch(String providerPaymentId) {
        return new GatewayPayment(providerPaymentId, outcome, "simulated_" + outcome.name().toLowerCase());
    }
}
