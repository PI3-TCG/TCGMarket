package com.pitcc.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CheckoutValidationService;
import java.math.BigDecimal;
import java.util.List;
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

@WebMvcTest(CheckoutController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class CheckoutControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private CheckoutValidationService validationService;

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
    mockMvc.perform(post("/api/users/me/checkout/validate")).andExpect(status().isUnauthorized());
  }

  @Test
  void returnsItemsThatNeedReview() throws Exception {
    when(validationService.validate("u1"))
        .thenReturn(
            new CheckoutValidationResponse(
                false,
                false,
                List.of(
                    new ItemIssue(
                        "ad-1",
                        List.of(IssueCode.PRICE_CHANGED),
                        1,
                        3,
                        new BigDecimal("10.00"),
                        new BigDecimal("12.00"))),
                List.of(),
                BigDecimal.ZERO));

    mockMvc
        .perform(post("/api/users/me/checkout/validate").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.valid").value(false))
        .andExpect(jsonPath("$.items[0].adId").value("ad-1"))
        .andExpect(jsonPath("$.items[0].issues[0]").value("PRICE_CHANGED"))
        .andExpect(jsonPath("$.items[0].currentUnitPrice").value(12.00));
  }
}
