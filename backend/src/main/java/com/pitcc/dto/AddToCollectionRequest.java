package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddToCollectionRequest(
        @NotBlank String cardId,
        @NotNull @Min(1) Integer quantity,
        @NotNull CardCondition condition,
        @NotNull CardLanguage language
) {}
