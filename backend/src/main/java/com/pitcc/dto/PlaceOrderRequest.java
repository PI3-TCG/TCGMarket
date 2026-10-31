package com.pitcc.dto;

import jakarta.validation.constraints.NotBlank;

public record PlaceOrderRequest(
        @NotBlank(message = "Selecione um endereço de entrega.")
        String addressId
) {
}
