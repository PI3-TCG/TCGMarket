
package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCollectionItemRequest(

        @NotNull(message = "A quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade deve ser maior que zero.")
        Integer quantity,

        @NotNull(message = "A condição é obrigatória.")
        CardCondition condition,

        @NotNull(message = "O idioma é obrigatório.")
        CardLanguage language

) {
}
