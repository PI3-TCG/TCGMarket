package com.pitcc.dto;

import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import java.time.Instant;

/** Projeção segura: não inclui e-mail, hash de senha ou tokens. */
public record AdminDashboardRecentUserResponse(
    String id,
    String name,
    String username,
    UserRole role,
    UserStatus status,
    Instant registrationDate
) {
  public static AdminDashboardRecentUserResponse from(User user) {
    return new AdminDashboardRecentUserResponse(
        user.getId(), user.getName(), user.getUsername(), user.getRole(),
        user.getStatus(), user.getRegistrationDate());
  }
}
