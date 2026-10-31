package com.pitcc.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.CheckoutOrdersResponse;
import com.pitcc.dto.CheckoutOrdersResponse.OrderResponse;
import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.exception.CheckoutConflictException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.CheckoutValidationService;
import com.pitcc.service.PlaceOrderService;
import java.math.BigDecimal;
import java.time.Instant;
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

  @MockitoBean private PlaceOrderService placeOrderService;

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

  @Test
  void placesOrderWithIdempotencyKey() throws Exception {
    when(placeOrderService.placeOrder("u1", "key-1", "addr-1"))
        .thenReturn(
            new CheckoutOrdersResponse(
                "checkout-1",
                List.of(
                    new OrderResponse(
                        "order-1", "seller-1", "vendedor1", OrderStatus.PENDING_PAYMENT,
                        List.of(), new BigDecimal("20.00"), null, Instant.now())),
                new BigDecimal("20.00")));

    mockMvc
        .perform(
            post("/api/users/me/checkout")
                .header(HttpHeaders.AUTHORIZATION, token)
                .header("Idempotency-Key", "key-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"addressId\":\"addr-1\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.checkoutId").value("checkout-1"))
        .andExpect(jsonPath("$.orders[0].status").value("PENDING_PAYMENT"))
        .andExpect(jsonPath("$.total").value(20.00));
  }

  @Test
  void returnsConflictWithItemsToReview() throws Exception {
    when(placeOrderService.placeOrder("u1", "key-1", "addr-1"))
        .thenThrow(
            new CheckoutConflictException(
                new CheckoutValidationResponse(
                    false,
                    false,
                    List.of(
                        new ItemIssue(
                            "ad-1", List.of(IssueCode.QUANTITY_UNAVAILABLE), 2, 1,
                            new BigDecimal("10.00"), new BigDecimal("10.00"))),
                    List.of(),
                    BigDecimal.ZERO)));

    mockMvc
        .perform(
            post("/api/users/me/checkout")
                .header(HttpHeaders.AUTHORIZATION, token)
                .header("Idempotency-Key", "key-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"addressId\":\"addr-1\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.items[0].issues[0]").value("QUANTITY_UNAVAILABLE"));
  }

  @Test
  void requiresDeliveryAddress() throws Exception {
    mockMvc
        .perform(
            post("/api/users/me/checkout")
                .header(HttpHeaders.AUTHORIZATION, token)
                .header("Idempotency-Key", "key-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest());
  }
}
