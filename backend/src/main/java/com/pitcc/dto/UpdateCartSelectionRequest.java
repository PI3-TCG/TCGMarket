package com.pitcc.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCartSelectionRequest(
        @NotNull(message = "Informe se os itens devem ser selecionados.")
        Boolean selected
) {
}
