package com.pitcc.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotBlank(message = "Informe o anúncio.")
        String adId,

        @NotNull(message = "Informe a quantidade.")
        @Min(value = 1, message = "A quantidade precisa ser maior que zero.")
        @Max(value = 9999, message = "Quantidade inválida.")
        Integer quantity
) {
}
