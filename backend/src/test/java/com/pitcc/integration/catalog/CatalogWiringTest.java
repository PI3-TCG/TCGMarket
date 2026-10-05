package com.pitcc.integration.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.pitcc.integration.catalog.config.ExternalApisProperties;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CatalogWiringTest {

  @Autowired
  private ExternalApisProperties properties;

  @Autowired
  private List<CardCatalogProvider> providers;

  @Test
  void shouldRegisterTheThreeCatalogProviders() {
    assertFalse(properties.pokemon().baseUrl().isBlank());
    assertFalse(properties.yugioh().baseUrl().isBlank());
    assertFalse(properties.mtg().baseUrl().isBlank());
    assertEquals(3, providers.size());
    assertEquals(
        Set.of(CardGame.POKEMON, CardGame.YUGIOH, CardGame.MAGIC_THE_GATHERING),
        providers.stream().map(provider -> provider.getCardGame()).collect(Collectors.toSet()));
  }
}
