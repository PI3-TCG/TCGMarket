package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.pitcc.dto.ProfileSettings;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.*;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.*;
import com.pitcc.service.ProfileDashboardService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProfileDashboardController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(properties = {"security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!", "security.jwt.expiration=1h"})
class ProfileDashboardControllerTest {
  @Autowired MockMvc mvc;
  @Autowired JwtService jwt;
  @MockitoBean ProfileDashboardService service;
  @MockitoBean UserRepository users;

  String token() {
    User user = new User(); user.setId("owner"); user.setRole(UserRole.USER);
    when(users.findById("owner")).thenReturn(Optional.of(user));
    return "Bearer " + jwt.generate("owner", UserRole.USER);
  }
  @Test void privateEndpointsRequireAuthentication() throws Exception {
    mvc.perform(get("/api/users/me/profile/dashboard")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/users/me/profile/settings")).andExpect(status().isUnauthorized());
    mvc.perform(put("/api/users/me/profile/settings").contentType(MediaType.APPLICATION_JSON).content("{\"collectionPublic\":true}"))
        .andExpect(status().isUnauthorized());
    verifyNoInteractions(service);
  }
  @Test void publicEndpointsAreAnonymousAndNeverCached() throws Exception {
    when(service.publicSummary("collector")).thenReturn(new ProfileDashboardService.PublicSummary(false, null, 2));
    when(service.publicCollection("collector", 0, 20)).thenReturn(new PageImpl<>(java.util.List.of()));
    mvc.perform(get("/api/users/collector/profile/summary")).andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-store"))
        .andExpect(jsonPath("$.collectionPublic").value(false))
        .andExpect(jsonPath("$.email").doesNotExist());
    mvc.perform(get("/api/users/collector/profile/collection")).andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-store"));
  }
  @Test void settingsUseAuthenticatedAccountAndRejectUnsafeImages() throws Exception {
    String token = token();
    when(service.updateSettings(eq("owner"), any())).thenReturn(new ProfileSettings(true, null));
    mvc.perform(put("/api/users/me/profile/settings").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON).content("{\"collectionPublic\":true,\"userId\":\"other\"}"))
        .andExpect(status().isOk());
    verify(service).updateSettings("owner", new ProfileSettings(true, null));
    mvc.perform(put("/api/users/me/profile/settings").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON).content("{\"collectionPublic\":true,\"avatarUrl\":\"javascript:alert(1)\"}"))
        .andExpect(status().isBadRequest());
    verify(service, times(1)).updateSettings(anyString(), any());
  }
}
