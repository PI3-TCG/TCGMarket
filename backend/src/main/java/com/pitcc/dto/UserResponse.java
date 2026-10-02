package com.pitcc.dto;

import com.pitcc.model.UserRole;
import java.time.LocalDateTime;

public record UserResponse(
    String id, String name, String email, UserRole role, LocalDateTime registrationDate) {}
