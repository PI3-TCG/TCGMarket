package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pitcc.dto.UserResponse;
import com.pitcc.exception.OwnRoleChangeException;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

  @Mock private UserRepository userRepository;

  private AdminUserService adminUserService;

  @BeforeEach
  void setUp() {
    adminUserService = new AdminUserService(userRepository);
  }

  @Test
  void shouldListUsersWithoutPasswordHash() {
    when(userRepository.findAll(any(Sort.class)))
        .thenReturn(List.of(user("user1", UserRole.USER), user("admin1", UserRole.ADMIN)));

    List<UserResponse> users = adminUserService.listUsers();

    assertEquals(2, users.size());
    assertEquals("user1", users.get(0).id());
    assertEquals(UserRole.ADMIN, users.get(1).role());
  }

  @Test
  void shouldPromoteAnotherUser() {
    User target = user("user1", UserRole.USER);
    when(userRepository.findById("user1")).thenReturn(Optional.of(target));
    when(userRepository.save(target)).thenReturn(target);

    UserResponse response = adminUserService.changeRole("admin1", "user1", UserRole.ADMIN);

    assertEquals(UserRole.ADMIN, response.role());
    assertEquals(UserRole.ADMIN, target.getRole());
    verify(userRepository).save(target);
  }

  @Test
  void shouldNotChangeTheOwnRole() {
    assertThrows(
        OwnRoleChangeException.class,
        () -> adminUserService.changeRole("admin1", "admin1", UserRole.USER));

    verify(userRepository, never()).findById(any());
    verify(userRepository, never()).save(any());
  }

  @Test
  void shouldFailWhenTheUserDoesNotExist() {
    when(userRepository.findById("missing")).thenReturn(Optional.empty());

    assertThrows(
        UserNotFoundException.class,
        () -> adminUserService.changeRole("admin1", "missing", UserRole.ADMIN));
  }

  @Test
  void shouldNotSaveWhenTheRoleIsAlreadyTheSame() {
    when(userRepository.findById("user1")).thenReturn(Optional.of(user("user1", UserRole.USER)));

    UserResponse response = adminUserService.changeRole("admin1", "user1", UserRole.USER);

    assertEquals(UserRole.USER, response.role());
    verify(userRepository, never()).save(any());
  }

  private User user(String id, UserRole role) {
    User user = new User();
    user.setId(id);
    user.setName("Nome " + id);
    user.setEmail(id + "@email.com");
    user.setPasswordHash("hash");
    user.setRole(role);
    user.setRegistrationDate(Instant.parse("2026-10-02T18:00:00Z"));
    return user;
  }
}
