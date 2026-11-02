package com.pitcc.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Registro do valor negociado, sem iniciar pagamento. Moeda fixa BRL. */
public record TradeFinancialAdjustmentRequest(
        @NotNull(message = "Informe o valor do complemento.")
        @DecimalMin(value = "0.01", message = "O complemento deve ser positivo.")
        @DecimalMax(value = "999999.99", message = "O complemento excede o limite permitido.")
        @Digits(integer = 6, fraction = 2, message = "Informe ate duas casas decimais.")
        BigDecimal amount,

        @NotNull(message = "Informe quem paga o complemento.")
        TradeFinancialAdjustmentPayer payer
) {
}
