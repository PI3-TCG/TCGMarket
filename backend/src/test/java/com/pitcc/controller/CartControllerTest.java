package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.CartResponse;
import com.pitcc.exception.AdUnavailableForPurchaseException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CartService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CartController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class CartControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private CartService cartService;

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
  void requiresLogin() throws Exception {
    mockMvc.perform(get("/api/users/me/cart")).andExpect(status().isUnauthorized());
  }

  @Test
  void returnsTheCartOfTheAuthenticatedUser() throws Exception {
    when(cartService.getCart("u1")).thenReturn(new CartResponse(List.of(), 0));

    mockMvc
        .perform(get("/api/users/me/cart").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.distinctItemCount").value(0));
  }

  @Test
  void rejectsInvalidQuantityBeforeCallingTheService() throws Exception {
    mockMvc
        .perform(
            post("/api/users/me/cart/items")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"adId\":\"ad-1\",\"quantity\":0}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Revise os dados do carrinho."))
        .andExpect(jsonPath("$.fields[0].field").value("quantity"));

    verify(cartService, never()).addItem(anyString(), anyString(), anyInt());
  }

  @Test
  void unavailableQuantityIsAConflict() throws Exception {
    when(cartService.addItem("u1", "ad-1", 5)).thenThrow(new AdUnavailableForPurchaseException(2));

    mockMvc
        .perform(
            post("/api/users/me/cart/items")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"adId\":\"ad-1\",\"quantity\":5}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("Há apenas 2 exemplares disponíveis para compra."));
  }

  @Test
  void removesItem() throws Exception {
    when(cartService.removeItem("u1", "ad-1")).thenReturn(new CartResponse(List.of(), 0));

    mockMvc
        .perform(delete("/api/users/me/cart/items/ad-1").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isOk());
  }
}
