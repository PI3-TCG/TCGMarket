package com.pitcc.service;

import com.pitcc.dto.UserResponse;
import com.pitcc.dto.UserResponses;
import com.pitcc.exception.OwnRoleChangeException;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserService {

  private final UserRepository userRepository;

  public AdminUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public List<UserResponse> listUsers() {
    return userRepository.findAll(Sort.by("name", "email")).stream()
        .map(UserResponses::toUserResponse)
        .toList();
  }

  public UserResponse changeRole(String actorId, String userId, UserRole role) {
    if (actorId.equals(userId)) {
      throw new OwnRoleChangeException();
    }
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
    if (user.getRole() == role) {
      return UserResponses.toUserResponse(user);
    }
    user.setRole(role);
    return UserResponses.toUserResponse(userRepository.save(user));
  }
}
