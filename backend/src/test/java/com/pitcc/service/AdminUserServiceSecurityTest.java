package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.pitcc.model.ModeratedProfileField;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import com.pitcc.repository.AdminActionRepository;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.AuthenticatedUser;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
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

  @MockitoBean private AdminActionRepository adminActionRepository;

  @MockitoBean private MongoTemplate mongoTemplate;

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void shouldBlockUserEvenIfTheServiceIsCalledDirectly() {
    authenticateAs(UserRole.USER);

    assertThrows(AccessDeniedException.class, this::search);
    assertThrows(
        AccessDeniedException.class,
        () -> adminUserService.changeRole("user1", "user1", UserRole.ADMIN));
    assertThrows(
        AccessDeniedException.class,
        () -> adminUserService.changeStatus(
            "user1", "user2", UserStatus.SUSPENDED, "Motivo qualquer aqui"));
    assertThrows(
        AccessDeniedException.class,
        () -> adminUserService.moderateProfile(
            "user1", "user2", List.of(ModeratedProfileField.BIO), "Motivo qualquer aqui"));
    assertThrows(AccessDeniedException.class, () -> adminUserService.recentActions(6));
  }

  @Test
  void shouldBlockAnonymousCalls() {
    assertThrows(AuthenticationCredentialsNotFoundException.class, this::search);
  }

  @Test
  void shouldAllowAdmin() {
    authenticateAs(UserRole.ADMIN);

    assertDoesNotThrow(this::search);
  }

  private void search() {
    adminUserService.searchUsers(null, null, null, null, null);
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
