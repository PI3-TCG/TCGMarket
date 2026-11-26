package com.pitcc.dto;

import jakarta.validation.constraints.NotBlank;

public record CardCollectionRequest(@NotBlank String name) {
}
