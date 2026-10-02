package com.pitcc.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.CreateUserRequest;
import com.pitcc.dto.UserResponse;
import com.pitcc.exception.EmailAlreadyRegisteredException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.UserRole;
import com.pitcc.service.UserService;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private UserService userService;

  @Test
  void shouldCreateUserWithoutReturningPasswordHash() throws Exception {
    when(userService.register(any(CreateUserRequest.class)))
        .thenReturn(
            new UserResponse(
                "abc123",
                "João Silva",
                "joao@email.com",
                UserRole.USER,
                Instant.parse("2026-10-02T18:00:00Z")));

    mockMvc
        .perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "João Silva",
                      "email": "joao@email.com",
                      "password": "Senha@123",
                      "role": "ADMIN"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("abc123"))
        .andExpect(jsonPath("$.name").value("João Silva"))
        .andExpect(jsonPath("$.email").value("joao@email.com"))
        .andExpect(jsonPath("$.role").value("USER"))
        .andExpect(jsonPath("$.registrationDate").value("2026-10-02T18:00:00Z"))
        .andExpect(jsonPath("$.password").doesNotExist())
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
  }

  @Test
  void shouldAcceptPasswordWithoutLowercase() throws Exception {
    when(userService.register(any(CreateUserRequest.class)))
        .thenReturn(
            new UserResponse(
                "abc123",
                "João Silva",
                "joao@email.com",
                UserRole.USER,
                Instant.parse("2026-10-02T18:00:00Z")));

    mockMvc
        .perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "João Silva",
                      "email": "joao@email.com",
                      "password": "AB12!@"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.password").doesNotExist())
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
  }

  @Test
  void shouldRejectPasswordWithoutRequiredCharacters() throws Exception {
    mockMvc
        .perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "João Silva",
                      "email": "joao@email.com",
                      "password": "senha@1"
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.fields[?(@.field == 'password')].message")
                .value(hasItem("A senha deve conter letra maiúscula, número e caractere especial.")));
  }

  @Test
  void shouldRejectInvalidPayload() throws Exception {
    mockMvc
        .perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": " ",
                      "email": "invalido",
                      "password": "fraca"
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Dados de cadastro inválidos."))
        .andExpect(jsonPath("$.fields").isArray());
  }

  @Test
  void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
    when(userService.register(any(CreateUserRequest.class)))
        .thenThrow(new EmailAlreadyRegisteredException("joao@email.com"));

    mockMvc
        .perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "João Silva",
                      "email": "joao@email.com",
                      "password": "Senha@123"
                    }
                    """))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("Já existe um usuário cadastrado com o e-mail joao@email.com."))
        .andExpect(jsonPath("$.fields[0].field").value("email"));
  }
}
