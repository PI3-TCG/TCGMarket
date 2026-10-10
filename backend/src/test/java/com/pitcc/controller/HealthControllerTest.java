package com.pitcc.controller;

import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class HealthControllerTest {
  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private MongoTemplate mongoTemplate;

  @MockitoBean
  private UserRepository userRepository;

  @Test
  void shouldReturnHealthStatus() throws Exception {
    mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.status").value("On-The-Line"))
            .andExpect(jsonPath("$.message")
                    .value("Todo grande projeto começa com um primeiro endpoint. Esse é o nosso."));
  }

  @Test
  void shouldReportReadyWithoutAuthenticationWhenMongoAnswersPing() throws Exception {
    when(mongoTemplate.executeCommand("{ ping: 1 }")).thenReturn(new Document("ok", 1.0));

    mockMvc.perform(get("/api/health/ready"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
  }

  @Test
  void shouldReportUnavailableWithoutLeakingCauseWhenMongoFails() throws Exception {
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
            .thenThrow(new IllegalStateException("mongodb+srv://user:secret@cluster"));

    mockMvc.perform(get("/api/health/ready"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").value("DOWN"))
            .andExpect(jsonPath("$.message").value("Banco de dados indisponível."))
            .andExpect(content().string(not(containsString("secret"))));
  }
}
