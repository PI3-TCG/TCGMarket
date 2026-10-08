package com.pitcc.dto;

import com.pitcc.validation.MaxUtf8Bytes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 180, message = "O e-mail deve ter no máximo 180 caracteres.")
        String email,
    @NotBlank(message = "A senha é obrigatória.")
        @MaxUtf8Bytes(value = 72, message = "A senha deve ter no máximo 72 bytes em UTF-8.")
        String password) {}
