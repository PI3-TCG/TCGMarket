package com.pitcc.controller;

import com.pitcc.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
  @GetMapping
  public HealthResponse health() {
    return new HealthResponse("On-The-Line", "Todo grande projeto começa com um primeiro endpoint. Esse é o nosso.");
  }
}