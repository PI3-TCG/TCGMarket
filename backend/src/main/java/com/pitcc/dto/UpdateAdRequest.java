
package com.pitcc.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateAdRequest(
        @NotNull(message = "Informe se o anúncio aceita venda.")
        Boolean saleEnabled,

        @NotNull(message = "Informe se o anúncio aceita troca.")
        Boolean tradeEnabled,

        @DecimalMin(value = "0.01", message = "Informe um preço válido.")
        @DecimalMax(value = "999999.99", message = "Informe um preço válido.")
        @Digits(integer = 6, fraction = 2, message = "Informe um preço válido.")
        BigDecimal unitPrice,

        @Min(value = 1, message = "A quantidade deve ser maior que zero.")
        Integer quantity
) {
    public UpdateAdRequest(
            Boolean saleEnabled,
            Boolean tradeEnabled,
            BigDecimal unitPrice
    ) {
        this(saleEnabled, tradeEnabled, unitPrice, null);
    }
}
