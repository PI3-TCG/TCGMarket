package com.pitcc.model;

/**
 * Status do pagamento no domínio, independente do texto devolvido pelo
 * gateway. Só {@link #PENDING} pode mudar; os demais são finais.
 */
public enum PaymentStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED,
    EXPIRED;

    public boolean isFinal() {
        return this != PENDING;
    }
}
