package com.pitcc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record AvatarUploadRequest(@NotBlank String contentType, @Positive long contentLength) {}
