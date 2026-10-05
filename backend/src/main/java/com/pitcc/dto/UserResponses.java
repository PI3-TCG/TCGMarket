package com.pitcc.dto;

import com.pitcc.model.User;

public final class UserResponses {

  private UserResponses() {}

  public static UserResponse from(User user) {
    return new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getRegistrationDate());
  }
}
