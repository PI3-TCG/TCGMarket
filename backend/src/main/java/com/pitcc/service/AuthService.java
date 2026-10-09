package com.pitcc.service;

import com.pitcc.dto.LoginRequest;
import com.pitcc.dto.LoginResponse;
import com.pitcc.dto.UserResponse;
import com.pitcc.dto.UserResponses;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.InvalidCredentialsException;
import com.pitcc.model.User;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.security.JwtService;
import java.util.Locale;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private static final String DUMMY_PASSWORD_HASH = new BCryptPasswordEncoder().encode("timing-placeholder");

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public LoginResponse login(LoginRequest request) {
    String email = normalizeEmail(request.email());
    User user = userRepository.findByEmail(email).orElse(null);
    String hash = user == null ? DUMMY_PASSWORD_HASH : user.getPasswordHash();
    boolean passwordMatches = passwordEncoder.matches(request.password(), hash);
    if (user == null || !passwordMatches) {
      throw new InvalidCredentialsException();
    }

    String token = jwtService.generate(user.getId(), user.getRole());
    return new LoginResponse(token, UserResponses.toUserResponse(user));
  }

  public UserResponse currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser current)) {
      throw new InvalidAuthenticationException();
    }
    return userRepository
        .findById(current.id())
        .map(UserResponses::toUserResponse)
        .orElseThrow(InvalidAuthenticationException::new);
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }
}
