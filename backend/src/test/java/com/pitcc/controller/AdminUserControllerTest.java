package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.AdminUserResponse;
import com.pitcc.dto.CatalogPageResponse;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.OwnRoleChangeException;
import com.pitcc.exception.OwnStatusChangeException;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.ModeratedProfileField;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.AdminUserService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminUserController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class AdminUserControllerTest {

  private static final String ROLE_TO_ADMIN = """
      { "role": "ADMIN" }
      """;

  private static final String MODERATE_BIO = """
      { "fields": ["BIO"], "reason": "Bio com conteúdo impróprio" }
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private AdminUserService adminUserService;

  @MockitoBean private UserRepository userRepository;

  @Test
  void shouldRequireAuthenticationForAdminResources() throws Exception {
    mockMvc
        .perform(get("/api/admin/users"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value(SecurityConfig.AUTHENTICATION_REQUIRED));

    verifyNoSearch();
  }

  @Test
  void shouldForbidUserFromListingUsers() throws Exception {
    String token = tokenFor("user1", UserRole.USER);

    mockMvc
        .perform(get("/api/admin/users").header(HttpHeaders.AUTHORIZATION, bearer(token)))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403))
        .andExpect(jsonPath("$.message").value(SecurityConfig.ACCESS_DENIED));

    verifyNoSearch();
  }

  @Test
  void shouldSearchUsersForAdmin() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.searchUsers("ana", UserRole.USER, UserStatus.SUSPENDED, 1, 20))
        .thenReturn(CatalogPageResponse.of(
            List.of(response("user1", UserRole.USER), response("admin1", UserRole.ADMIN)),
            1, 20, 22));

    mockMvc
        .perform(
            get("/api/admin/users")
                .param("q", "ana")
                .param("role", "USER")
                .param("status", "SUSPENDED")
                .param("page", "1")
                .param("size", "20")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value("user1"))
        .andExpect(jsonPath("$.content[0].status").value("ACTIVE"))
        .andExpect(jsonPath("$.content[1].role").value("ADMIN"))
        .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist())
        .andExpect(jsonPath("$.totalElements").value(22))
        .andExpect(jsonPath("$.totalPages").value(2));
  }

  @Test
  void shouldRejectTokenOfSuspendedAccount() throws Exception {
    User user = new User();
    user.setId("admin1");
    user.setRole(UserRole.ADMIN);
    user.setStatus(UserStatus.SUSPENDED);
    when(userRepository.findById("admin1")).thenReturn(Optional.of(user));
    String token = jwtService.generate("admin1", UserRole.ADMIN);

    mockMvc
        .perform(get("/api/admin/users").header(HttpHeaders.AUTHORIZATION, bearer(token)))
        .andExpect(status().isUnauthorized());

    verifyNoSearch();
  }

  @Test
  void shouldSuspendAnotherUserUsingTheIdFromTheToken() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.changeStatus(
            "admin1", "user1", UserStatus.SUSPENDED, "Perfil com conteúdo ofensivo"))
        .thenReturn(response("user1", UserRole.USER));

    mockMvc
        .perform(
            patch("/api/admin/users/user1/status")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "status": "SUSPENDED", "reason": "  Perfil com conteúdo ofensivo  " }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("user1"));
  }

  @Test
  void shouldRequireAReasonToSuspend() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);

    mockMvc
        .perform(
            patch("/api/admin/users/user1/status")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "status": "SUSPENDED", "reason": "curto" }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Motivo inválido."))
        .andExpect(jsonPath("$.fields[0].field").value("reason"));

    verify(adminUserService, never()).changeStatus(anyString(), anyString(), any(), anyString());
  }

  @Test
  void shouldForbidAdminFromSuspendingTheOwnAccount() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.changeStatus(
            "admin1", "admin1", UserStatus.SUSPENDED, "Motivo qualquer aqui"))
        .thenThrow(new OwnStatusChangeException());

    mockMvc
        .perform(
            patch("/api/admin/users/admin1/status")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "status": "SUSPENDED", "reason": "Motivo qualquer aqui" }
                    """))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.message").value(OwnStatusChangeException.MESSAGE));
  }

  @Test
  void shouldForbidUserFromModeratingProfiles() throws Exception {
    String token = tokenFor("user1", UserRole.USER);

    mockMvc
        .perform(
            post("/api/admin/users/user2/profile/moderation")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(MODERATE_BIO))
        .andExpect(status().isForbidden());

    verify(adminUserService, never()).moderateProfile(anyString(), anyString(), any(), anyString());
  }

  @Test
  void shouldModerateTheSelectedFields() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.moderateProfile(
            "admin1", "user1", List.of(ModeratedProfileField.BIO), "Bio com conteúdo impróprio"))
        .thenReturn(response("user1", UserRole.USER));

    mockMvc
        .perform(
            post("/api/admin/users/user1/profile/moderation")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(MODERATE_BIO))
        .andExpect(status().isOk());
  }

  @Test
  void shouldRequireAtLeastOneFieldToModerate() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);

    mockMvc
        .perform(
            post("/api/admin/users/user1/profile/moderation")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "fields": [], "reason": "Bio com conteúdo impróprio" }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fields[0].field").value("fields"));
  }

  @Test
  void shouldListRecentActionsForAdmin() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.recentActions(6)).thenReturn(List.of());

    mockMvc
        .perform(
            get("/api/admin/events")
                .param("limit", "6")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
        .andExpect(status().isOk());

    verify(adminUserService).recentActions(6);
  }

  @Test
  void shouldUseTheRoleStoredInTheDatabaseInsteadOfTheTokenClaim() throws Exception {
    stored("admin1", UserRole.USER);
    String tokenFromBeforeDemotion = jwtService.generate("admin1", UserRole.ADMIN);

    mockMvc
        .perform(
            get("/api/admin/users")
                .header(HttpHeaders.AUTHORIZATION, bearer(tokenFromBeforeDemotion)))
        .andExpect(status().isForbidden());

    verifyNoSearch();
  }

  @Test
  void shouldRejectTokenOfAccountThatNoLongerExists() throws Exception {
    when(userRepository.findById("ghost")).thenReturn(Optional.empty());
    String token = jwtService.generate("ghost", UserRole.ADMIN);

    mockMvc
        .perform(get("/api/admin/users").header(HttpHeaders.AUTHORIZATION, bearer(token)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void shouldForbidUserFromPromotingTheOwnAccount() throws Exception {
    String token = tokenFor("user1", UserRole.USER);

    mockMvc
        .perform(
            patch("/api/admin/users/user1/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(ROLE_TO_ADMIN))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.message").value(SecurityConfig.ACCESS_DENIED));

    verify(adminUserService, never()).changeRole(anyString(), anyString(), any());
  }

  @Test
  void shouldLetAdminChangeAnotherUsersRoleUsingTheIdFromTheToken() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.changeRole("admin1", "user1", UserRole.ADMIN))
        .thenReturn(response("user1", UserRole.ADMIN));

    mockMvc
        .perform(
            patch("/api/admin/users/user1/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(ROLE_TO_ADMIN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("user1"))
        .andExpect(jsonPath("$.role").value("ADMIN"));

    verify(adminUserService).changeRole("admin1", "user1", UserRole.ADMIN);
  }

  @Test
  void shouldForbidAdminFromChangingTheOwnRole() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.changeRole("admin1", "admin1", UserRole.USER))
        .thenThrow(new OwnRoleChangeException());

    mockMvc
        .perform(
            patch("/api/admin/users/admin1/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "role": "USER" }
                    """))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.message").value(OwnRoleChangeException.MESSAGE));
  }

  @Test
  void shouldRejectUnknownRole() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);

    mockMvc
        .perform(
            patch("/api/admin/users/user1/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "role": "SUPERADMIN" }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Corpo da requisição inválido."));

    verify(adminUserService, never()).changeRole(anyString(), anyString(), any());
  }

  @Test
  void shouldRejectMissingRole() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);

    mockMvc
        .perform(
            patch("/api/admin/users/user1/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Perfil inválido."))
        .andExpect(jsonPath("$.fields[0].field").value("role"));
  }

  @Test
  void shouldReturnNotFoundForUnknownUser() throws Exception {
    String token = tokenFor("admin1", UserRole.ADMIN);
    when(adminUserService.changeRole("admin1", "missing", UserRole.ADMIN))
        .thenThrow(new UserNotFoundException());

    mockMvc
        .perform(
            patch("/api/admin/users/missing/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(ROLE_TO_ADMIN))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value(UserNotFoundException.MESSAGE));
  }

  private String tokenFor(String id, UserRole role) {
    stored(id, role);
    return jwtService.generate(id, role);
  }

  private void stored(String id, UserRole role) {
    User user = new User();
    user.setId(id);
    user.setRole(role);
    when(userRepository.findById(id)).thenReturn(Optional.of(user));
  }

  private static String bearer(String token) {
    return "Bearer " + token;
  }

  private void verifyNoSearch() {
    verify(adminUserService, never()).searchUsers(any(), any(), any(), any(), any());
  }

  private static AdminUserResponse response(String id, UserRole role) {
    return new AdminUserResponse(
        id, "Nome " + id, id, id + "@email.com", role, UserStatus.ACTIVE,
        Instant.parse("2026-10-02T18:00:00Z"));
  }
}
