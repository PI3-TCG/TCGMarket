package com.pitcc.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TradeOfferedItemRequest(
        @NotBlank(message = "Informe o item da colecao.") String collectionItemId,
        @NotNull(message = "Informe a quantidade oferecida.")
        @Min(value = 1, message = "A quantidade oferecida deve ser positiva.") Integer quantity
) {
}
