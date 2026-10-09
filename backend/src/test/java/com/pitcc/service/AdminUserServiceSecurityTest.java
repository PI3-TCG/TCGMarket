package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.AuthenticatedUser;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(AdminUserServiceSecurityTest.MethodSecurity.class)
class AdminUserServiceSecurityTest {

  @Configuration
  @EnableMethodSecurity
  @Import(AdminUserService.class)
  static class MethodSecurity {}

  @Autowired private AdminUserService adminUserService;

  @MockitoBean private UserRepository userRepository;

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void shouldBlockUserEvenIfTheServiceIsCalledDirectly() {
    authenticateAs(UserRole.USER);

    assertThrows(AccessDeniedException.class, () -> adminUserService.listUsers());
    assertThrows(
        AccessDeniedException.class,
        () -> adminUserService.changeRole("user1", "user1", UserRole.ADMIN));
  }

  @Test
  void shouldBlockAnonymousCalls() {
    assertThrows(
        AuthenticationCredentialsNotFoundException.class, () -> adminUserService.listUsers());
  }

  @Test
  void shouldAllowAdmin() {
    authenticateAs(UserRole.ADMIN);
    when(userRepository.findAll(any(Sort.class))).thenReturn(List.of());

    assertDoesNotThrow(() -> adminUserService.listUsers());
  }

  private void authenticateAs(UserRole role) {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new AuthenticatedUser("abc123", role),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))));
  }
}
