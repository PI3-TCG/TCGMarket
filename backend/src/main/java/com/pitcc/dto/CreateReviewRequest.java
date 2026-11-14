package com.pitcc.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @NotNull(message = "A nota é obrigatória.")
        @Min(value = 1, message = "A nota deve estar entre 1 e 5.")
        @Max(value = 5, message = "A nota deve estar entre 1 e 5.")
        Integer grade,

        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres.")
        String comment
) {

    public CreateReviewRequest {
        comment = comment == null || comment.isBlank() ? null : comment.strip();
    }
}
