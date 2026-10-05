package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pitcc.dto.LoginRequest;
import com.pitcc.dto.LoginResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.InvalidCredentialsException;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.security.JwtProperties;
import com.pitcc.security.JwtService;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  private static final String PASSWORD = "Senha@123";

  @Mock private UserRepository userRepository;

  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final JwtService jwtService =
      new JwtService(new JwtProperties("test-secret-key-must-be-at-least-32-bytes!", Duration.ofHours(1)));
  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, passwordEncoder, jwtService);
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void shouldLoginWithNormalizedEmailAndReturnTokenWithoutPassword() {
    User user = user("abc123", "joao@email.com", passwordEncoder.encode(PASSWORD));
    when(userRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(user));

    LoginResponse response = authService.login(new LoginRequest(" Joao@Email.com ", PASSWORD));

    assertEquals("abc123", response.user().id());
    assertEquals("João Silva", response.user().name());
    assertEquals("joao@email.com", response.user().email());
    assertEquals(UserRole.USER, response.user().role());
    assertNotNull(response.token());
    assertTrue(jwtService.parse(response.token()).isPresent());
    assertEquals("abc123", jwtService.parse(response.token()).orElseThrow().id());
    assertEquals(UserRole.USER, jwtService.parse(response.token()).orElseThrow().role());
    verify(userRepository).findByEmail("joao@email.com");
  }

  @Test
  void shouldRejectUnknownEmailAndWrongPasswordWithTheSameMessage() {
    User user = user("abc123", "joao@email.com", passwordEncoder.encode(PASSWORD));
    when(userRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(user));
    when(userRepository.findByEmail("ausente@email.com")).thenReturn(Optional.empty());

    InvalidCredentialsException wrongPassword =
        assertThrows(
            InvalidCredentialsException.class,
            () -> authService.login(new LoginRequest("joao@email.com", "Outra@123")));
    InvalidCredentialsException unknownEmail =
        assertThrows(
            InvalidCredentialsException.class,
            () -> authService.login(new LoginRequest("ausente@email.com", PASSWORD)));

    assertEquals(InvalidCredentialsException.MESSAGE, wrongPassword.getMessage());
    assertEquals(wrongPassword.getMessage(), unknownEmail.getMessage());
  }

  @Test
  void shouldIdentifyTheAuthenticatedUser() {
    User user = user("abc123", "joao@email.com", passwordEncoder.encode(PASSWORD));
    when(userRepository.findById("abc123")).thenReturn(Optional.of(user));
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(new AuthenticatedUser("abc123", UserRole.USER), null));

    var response = authService.currentUser();

    assertEquals("abc123", response.id());
    assertEquals("joao@email.com", response.email());
    assertEquals(UserRole.USER, response.role());
  }

  @Test
  void shouldRejectCurrentUserWhenTheAccountNoLongerExists() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(new AuthenticatedUser("abc123", UserRole.ADMIN), null));
    when(userRepository.findById("abc123")).thenReturn(Optional.empty());

    assertThrows(InvalidAuthenticationException.class, () -> authService.currentUser());
  }

  private User user(String id, String email, String passwordHash) {
    User user = new User();
    user.setId(id);
    user.setName("João Silva");
    user.setEmail(email);
    user.setPasswordHash(passwordHash);
    user.setRole(UserRole.USER);
    user.setRegistrationDate(Instant.parse("2026-10-02T18:00:00Z"));
    return user;
  }
}
