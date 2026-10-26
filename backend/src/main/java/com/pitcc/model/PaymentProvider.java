package com.pitcc.model;

public enum PaymentProvider {
    /** Simulador interno, sem rede. Padrão em desenvolvimento, testes e CI. */
    SIMULATED,
    /** Mercado Pago em ambiente de teste (sandbox). */
    MERCADO_PAGO
}
