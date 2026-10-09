package com.pitcc.controller;

import com.pitcc.dto.HealthResponse;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
  private final MongoTemplate mongoTemplate;

  public HealthController(MongoTemplate mongoTemplate) {
    this.mongoTemplate = mongoTemplate;
  }

  @GetMapping
  public HealthResponse health() {
    return new HealthResponse("On-The-Line", "Todo grande projeto começa com um primeiro endpoint. Esse é o nosso.");
  }

  // A causa da falha fica fora da resposta porque o endpoint é público.
  @GetMapping("/ready")
  public ResponseEntity<HealthResponse> ready() {
    try {
      mongoTemplate.executeCommand("{ ping: 1 }");
      return ResponseEntity.ok(new HealthResponse("UP", "API pronta para receber tráfego."));
    } catch (RuntimeException exception) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(new HealthResponse("DOWN", "Banco de dados indisponível."));
    }
  }
}
