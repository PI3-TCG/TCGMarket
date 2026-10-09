package com.pitcc.dto;

import com.pitcc.model.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(@NotNull(message = "O perfil é obrigatório.") UserRole role) {}
