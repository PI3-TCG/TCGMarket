package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.RemoveCollectionItemService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RemoveCollectionItemController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class RemoveCollectionItemControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private RemoveCollectionItemService removeCollectionItemService;

  @MockitoBean private UserRepository userRepository;

  private String token;

  @BeforeEach
  void authenticate() {
    User user = new User();
    user.setId("u1");
    user.setRole(UserRole.USER);
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));
    token = "Bearer " + jwtService.generate("u1", UserRole.USER);
  }

  @Test
  void shouldRequireAuthentication() throws Exception {
    mockMvc
        .perform(delete("/api/users/me/collection/item-1"))
        .andExpect(status().isUnauthorized());

    verify(removeCollectionItemService, never()).removeCollectionItem(any(), any());
  }

  @Test
  void shouldRemoveItemOfAuthenticatedUser() throws Exception {
    mockMvc
        .perform(delete("/api/users/me/collection/item-1").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isNoContent());

    verify(removeCollectionItemService).removeCollectionItem("u1", "item-1");
  }

  @Test
  void shouldReturnNotFoundForItemOfAnotherUser() throws Exception {
    doThrow(new CollectionItemNotFoundException())
        .when(removeCollectionItemService)
        .removeCollectionItem("u1", "item-2");

    mockMvc
        .perform(delete("/api/users/me/collection/item-2").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Item da coleção não encontrado."));
  }

  @Test
  void shouldReturnConflictForItemInActiveAd() throws Exception {
    doThrow(new CollectionItemInActiveAdException())
        .when(removeCollectionItemService)
        .removeCollectionItem("u1", "item-1");

    mockMvc
        .perform(delete("/api/users/me/collection/item-1").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value(
                    "Esta carta está em um anúncio ativo. "
                        + "Encerre o anúncio antes de removê-la da coleção."));
  }
}
