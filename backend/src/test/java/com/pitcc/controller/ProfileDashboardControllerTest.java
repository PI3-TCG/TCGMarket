package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.pitcc.dto.ProfileSettings;
import com.pitcc.dto.CollectionFilters;
import com.pitcc.dto.CollectionFilterOptionsResponse;
import java.util.List;
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
    mvc.perform(post("/api/users/me/profile/avatar/upload-url").contentType(MediaType.APPLICATION_JSON)
        .content("{\"contentType\":\"image/png\",\"contentLength\":10}")).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/users/me/profile/avatar").contentType(MediaType.APPLICATION_JSON)
        .content("{\"key\":\"avatars/owner/photo.png\"}")).andExpect(status().isUnauthorized());
    verifyNoInteractions(service);
  }
  @Test void publicEndpointsAreAnonymousAndNeverCached() throws Exception {
    when(service.publicSummary("collector")).thenReturn(new ProfileDashboardService.PublicSummary(false, null, 2, java.util.List.of()));
    when(service.publicCollection("collector", 0, 20, new CollectionFilters(null, null, null, null, null, null))).thenReturn(new PageImpl<>(java.util.List.of()));
    mvc.perform(get("/api/users/collector/profile/summary")).andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-store"))
        .andExpect(jsonPath("$.collectionPublic").value(false))
        .andExpect(jsonPath("$.collectionGames").isEmpty())
        .andExpect(jsonPath("$.email").doesNotExist());
    mvc.perform(get("/api/users/collector/profile/collection")).andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-store"));
  }
  @Test void publicCollectionAppliesFiltersAndPublishesOptionsWithoutCaching() throws Exception {
    mvc.perform(get("/api/users/collector/profile/collection")
        .param("game", "POKEMON").param("edition", "Base").param("rarity", "Rare"))
        .andExpect(status().isOk());
    verify(service).publicCollection("collector", 0, 20,
        new CollectionFilters(null, CardGame.POKEMON, "Base", "Rare", null, null));

    when(service.publicCollectionFilterOptions("collector"))
        .thenReturn(new CollectionFilterOptionsResponse(List.of("Base"), List.of("Rare")));
    mvc.perform(get("/api/users/collector/profile/collection/filter-options"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-store"))
        .andExpect(jsonPath("$.editions[0]").value("Base"))
        .andExpect(jsonPath("$.rarities[0]").value("Rare"));
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
