package com.pitcc.integration.catalog.config;

import com.pitcc.integration.catalog.mtg.MtgClient;
import com.pitcc.integration.catalog.pokemon.PokemonTcgClient;
import com.pitcc.integration.catalog.yugioh.YugiohClient;
import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ExternalApisProperties.class)
public class ExternalApiClientConfig {

  static final String USER_AGENT = "TCGMarket/0.0.1";
  private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(10);

  @Bean
  PokemonTcgClient pokemonTcgClient(ExternalApisProperties properties) {
    ExternalApisProperties.Pokemon pokemon = requireConfigured(properties.pokemon(), "external-apis.pokemon.base-url");
    RestClient.Builder builder = restClientBuilder(pokemon.baseUrl(), pokemon.timeout());
    applyPokemonApiKey(builder, pokemon.apiKey());
    return new PokemonTcgClient(builder.build());
  }

  @Bean
  YugiohClient yugiohClient(ExternalApisProperties properties) {
    ExternalApisProperties.Yugioh yugioh = requireConfigured(properties.yugioh(), "external-apis.yugioh.base-url");
    return new YugiohClient(restClientBuilder(yugioh.baseUrl(), yugioh.timeout()).build());
  }

  @Bean
  MtgClient mtgClient(ExternalApisProperties properties) {
    ExternalApisProperties.Mtg mtg = requireConfigured(properties.mtg(), "external-apis.mtg.base-url");
    return new MtgClient(restClientBuilder(mtg.baseUrl(), mtg.timeout()).build());
  }

  static RestClient.Builder restClientBuilder(String baseUrl, Duration timeout) {
    Duration effectiveTimeout = timeout == null ? DEFAULT_TIMEOUT : timeout;
    HttpClient httpClient = HttpClient.newBuilder().connectTimeout(effectiveTimeout).build();
    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
    requestFactory.setReadTimeout(effectiveTimeout);
    return RestClient.builder()
        .baseUrl(normalizeBaseUrl(baseUrl))
        .requestFactory(requestFactory)
        .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
        .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT);
  }

  static void applyPokemonApiKey(RestClient.Builder builder, String apiKey) {
    if (apiKey != null && !apiKey.isBlank()) {
      builder.defaultHeader("X-Api-Key", apiKey.trim());
    }
  }

  private static <T> T requireConfigured(T value, String property) {
    if (value == null) {
      throw new IllegalStateException(property + " is required");
    }
    return value;
  }

  private static String normalizeBaseUrl(String baseUrl) {
    if (baseUrl == null || baseUrl.isBlank()) {
      throw new IllegalStateException("External API base URL is required");
    }
    String trimmed = baseUrl.trim();
    if (trimmed.endsWith("/")) {
      return trimmed.substring(0, trimmed.length() - 1);
    }
    return trimmed;
  }
}
