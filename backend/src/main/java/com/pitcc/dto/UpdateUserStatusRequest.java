package com.pitcc.dto;

import com.pitcc.model.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserStatusRequest(
    @NotNull(message = "A situação é obrigatória.") UserStatus status,
    @NotBlank(message = "O motivo é obrigatório.")
        @Size(min = 10, max = 300, message = "O motivo deve ter entre 10 e 300 caracteres.")
        String reason) {

  public UpdateUserStatusRequest {
    reason = reason == null ? null : reason.strip();
  }
}
