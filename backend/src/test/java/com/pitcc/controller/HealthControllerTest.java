package com.pitcc.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void shouldReturnHealthStatus() throws Exception {
    mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.status").value("On-The-Line"))
            .andExpect(jsonPath("$.message")
                    .value("Todo grande projeto começa com um primeiro endpoint. Esse é o nosso."));
  }
}
