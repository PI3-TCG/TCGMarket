package com.pitcc.integration.catalog.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-apis")
public record ExternalApisProperties(Pokemon pokemon, Yugioh yugioh, Mtg mtg) {

  public record Pokemon(String baseUrl, String apiKey, Duration timeout) {

    @Override
    public String toString() {
      boolean present = apiKey != null && !apiKey.isBlank();
      return "Pokemon[baseUrl=" + baseUrl + ", apiKey=" + (present ? "present" : "absent") + ", timeout=" + timeout + "]";
    }
  }

  public record Yugioh(String baseUrl, Duration timeout) {}

  public record Mtg(String baseUrl, Duration timeout) {}
}
