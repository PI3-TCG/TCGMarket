package com.pitcc.config;

import com.pitcc.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import(PermitAllSecurityConfig.class)
@TestPropertySource(
    properties = "app.cors.allowed-origin-patterns=https://hml.example.com,https://*.example.org")
class CorsConfigTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MongoTemplate mongoTemplate;

  @Test
  void shouldAllowPatchPreflightFromConfiguredOrigin() throws Exception {
    mockMvc
        .perform(
            options("/api/admin/users/123/role")
                .header(HttpHeaders.ORIGIN, "https://hml.example.com")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PATCH"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://hml.example.com"));
  }

  @Test
  void shouldAcceptConfiguredWildcardSubdomainPattern() throws Exception {
    mockMvc
        .perform(
            options("/api/health")
                .header(HttpHeaders.ORIGIN, "https://app.example.org")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://app.example.org"));
  }

  @Test
  void shouldRejectPreflightFromUnknownOrigin() throws Exception {
    mockMvc
        .perform(
            options("/api/health")
                .header(HttpHeaders.ORIGIN, "https://attacker.example.net")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
  }
}
