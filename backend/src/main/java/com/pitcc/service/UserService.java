package com.pitcc.service;

import com.pitcc.dto.CreateUserRequest;
import com.pitcc.dto.UserResponse;
import com.pitcc.exception.EmailAlreadyRegisteredException;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserResponse register(CreateUserRequest request) {
    String email = normalizeEmail(request.email());
    if (userRepository.existsByEmail(email)) {
      throw new EmailAlreadyRegisteredException(email);
    }

    User user = new User();
    user.setName(request.name().trim());
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole(UserRole.USER);
    user.setRegistrationDate(LocalDateTime.now(ZoneOffset.UTC));

    try {
      return toResponse(userRepository.save(user));
    } catch (DuplicateKeyException exception) {
      throw new EmailAlreadyRegisteredException(email);
    }
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private UserResponse toResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getRegistrationDate());
  }
}
