package com.pitcc.integration.payment;

/** Falha técnica ao falar com o provedor. O pagamento continua pendente. */
public class PaymentGatewayException extends RuntimeException {

    public PaymentGatewayException(String message) {
        super(message);
    }

    public PaymentGatewayException(String message, Throwable cause) {
        super(message, cause);
    }
}
