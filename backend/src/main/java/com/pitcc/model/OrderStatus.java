package com.pitcc.model;

/**
 * Ciclo de vida do pedido:
 * PENDING_PAYMENT → PAID → COMPLETED, ou PENDING_PAYMENT → PAYMENT_FAILED.
 * Estados finais não voltam atrás.
 */
public enum OrderStatus {
    /** Exemplares reservados no anúncio, aguardando o resultado do pagamento. */
    PENDING_PAYMENT,
    /** Pagamento aprovado e exemplares baixados do anúncio. */
    PAID,
    /** Cartas transferidas e transação registrada no histórico. */
    COMPLETED,
    /** Pagamento recusado, cancelado ou expirado; reserva liberada. */
    PAYMENT_FAILED
}
