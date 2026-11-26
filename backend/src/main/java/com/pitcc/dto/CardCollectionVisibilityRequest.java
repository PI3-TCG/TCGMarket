package com.pitcc.dto;

import jakarta.validation.constraints.NotNull;

public record CardCollectionVisibilityRequest(@NotNull Boolean visible) {
}
