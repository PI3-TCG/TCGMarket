package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.AdminDashboardOverviewResponse;
import com.pitcc.dto.AdminDashboardRecentUserResponse;
import com.pitcc.model.UserStatus;
import java.time.Instant;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.AdminDashboardService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminDashboardController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(properties = {
    "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
    "security.jwt.expiration=1h"
})
class AdminDashboardControllerTest {
  @Autowired private MockMvc mockMvc;
  @Autowired private JwtService jwtService;
  @MockitoBean private AdminDashboardService dashboard;
  @MockitoBean private UserRepository userRepository;

  @Test
  void anonymousCannotAccessDashboard() throws Exception {
    mockMvc.perform(get("/api/admin/overview")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/admin/activity")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/admin/recent/users")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/admin/recent/ads")).andExpect(status().isUnauthorized());
  }

  @Test
  void userCannotAccessAnyDashboardEndpoint() throws Exception {
    String bearer = bearerFor("user-1", UserRole.USER);
    for (String path : List.of("/api/admin/overview", "/api/admin/activity?days=7",
        "/api/admin/recent/users", "/api/admin/recent/ads")) {
      mockMvc.perform(get(path).header(HttpHeaders.AUTHORIZATION, bearer))
          .andExpect(status().isForbidden());
    }
    verify(dashboard, never()).activity(anyInt());
  }

  @Test
  void adminCanReadOverviewWithoutSensitiveFields() throws Exception {
    String bearer = bearerFor("admin-1", UserRole.ADMIN);
    when(dashboard.overview()).thenReturn(new AdminDashboardOverviewResponse(
        new AdminDashboardOverviewResponse.Metric(12L, null),
        new AdminDashboardOverviewResponse.Metric(125L, null),
        null, null, List.of()));

    mockMvc.perform(get("/api/admin/overview").header(HttpHeaders.AUTHORIZATION, bearer))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.registeredUsers.value").value(12))
        .andExpect(jsonPath("$.catalogCards.value").value(125))
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
  }

  @Test
  void recentUsersNeverExposeEmailOrPasswords() throws Exception {
    String bearer = bearerFor("admin-1", UserRole.ADMIN);
    when(dashboard.recentUsers()).thenReturn(List.of(
        new AdminDashboardRecentUserResponse("u-1", "Ana", "ana", UserRole.USER,
            UserStatus.ACTIVE, Instant.parse("2026-11-14T12:00:00Z"))));
    mockMvc.perform(get("/api/admin/recent/users").header(HttpHeaders.AUTHORIZATION, bearer))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Ana"))
        .andExpect(jsonPath("$[0].email").doesNotExist())
        .andExpect(jsonPath("$[0].passwordHash").doesNotExist());
  }

  @Test
  void activityRejectsUnsupportedPeriods() throws Exception {
    String bearer = bearerFor("admin-1", UserRole.ADMIN);
    mockMvc.perform(get("/api/admin/activity").param("days", "365")
        .header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isBadRequest());
    verify(dashboard, never()).activity(anyInt());
  }

  private String bearerFor(String id, UserRole role) {
    User user = new User();
    user.setId(id);
    user.setRole(role);
    when(userRepository.findById(id)).thenReturn(Optional.of(user));
    return "Bearer " + jwtService.generate(id, role);
  }
}
