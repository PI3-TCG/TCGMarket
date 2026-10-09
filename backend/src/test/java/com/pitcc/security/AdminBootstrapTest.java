package com.pitcc.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

  @Mock private UserRepository userRepository;

  @Test
  void shouldDoNothingWhenAdminEmailIsBlank() {
    new AdminBootstrap(userRepository, " ").run(new DefaultApplicationArguments());

    verifyNoInteractions(userRepository);
  }

  @Test
  void shouldPromoteTheConfiguredAccountUsingTheNormalizedEmail() {
    User user = user(UserRole.USER);
    when(userRepository.findByEmail("admin@email.com")).thenReturn(Optional.of(user));

    new AdminBootstrap(userRepository, " Admin@Email.com ").run(new DefaultApplicationArguments());

    assertEquals(UserRole.ADMIN, user.getRole());
    verify(userRepository).save(user);
  }

  @Test
  void shouldNotSaveWhenTheAccountIsAlreadyAdmin() {
    when(userRepository.findByEmail("admin@email.com")).thenReturn(Optional.of(user(UserRole.ADMIN)));

    new AdminBootstrap(userRepository, "admin@email.com").run(new DefaultApplicationArguments());

    verify(userRepository, never()).save(any());
  }

  @Test
  void shouldNotCreateAnAccountWhenTheEmailIsUnknown() {
    when(userRepository.findByEmail("admin@email.com")).thenReturn(Optional.empty());

    new AdminBootstrap(userRepository, "admin@email.com").run(new DefaultApplicationArguments());

    verify(userRepository, never()).save(any());
  }

  private User user(UserRole role) {
    User user = new User();
    user.setId("abc123");
    user.setEmail("admin@email.com");
    user.setRole(role);
    return user;
  }
}
