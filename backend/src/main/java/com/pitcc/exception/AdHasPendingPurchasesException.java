package com.pitcc.exception;

public class AdHasPendingPurchasesException extends RuntimeException {

    public AdHasPendingPurchasesException() {
        super("Este anúncio tem compras aguardando pagamento. Tente novamente quando elas terminarem.");
    }
}
