package com.pitcc.dto;

import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import java.time.Instant;

public record AdminUserResponse(
    String id,
    String name,
    String username,
    String email,
    UserRole role,
    UserStatus status,
    Instant registrationDate) {

  public static AdminUserResponse from(User user) {
    return new AdminUserResponse(
        user.getId(),
        user.getName(),
        user.getUsername(),
        user.getEmail(),
        user.getRole(),
        user.getStatus(),
        user.getRegistrationDate());
  }
}
