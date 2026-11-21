package com.pitcc.dto;

import jakarta.validation.constraints.NotBlank;

public record AvatarConfirmRequest(@NotBlank String key) {}
