package com.pitcc.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** Campos nulos não são alterados. */
public record UpdateCartItemRequest(
        @Min(value = 1, message = "A quantidade precisa ser maior que zero.")
        @Max(value = 9999, message = "Quantidade inválida.")
        Integer quantity,

        Boolean selected,

        // true aceita o preço atual do anúncio.
        Boolean acceptCurrentPrice
) {
}
