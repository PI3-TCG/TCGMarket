package com.pitcc.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.config.PermitAllSecurityConfig;
import com.pitcc.dto.CatalogCardResponse;
import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import com.pitcc.model.CardGame;
import com.pitcc.service.CatalogSearchService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CatalogController.class)
@Import({GlobalExceptionHandler.class, PermitAllSecurityConfig.class})
class CatalogControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private CatalogSearchService catalogSearchService;

  @Test
  void shouldReturnCardsFromTheRequestedCatalog() throws Exception {
    when(catalogSearchService.search("pokemon", "charizard"))
        .thenReturn(List.of(new CatalogCardResponse(
            "base1-4",
            null,
            "Charizard",
            com.pitcc.model.CardGame.POKEMON,
            "Base",
            "base1",
            "4",
            "Rare Holo",
            "https://img.example/charizard.png")));

    mockMvc.perform(get("/api/catalog/pokemon/cards").param("q", "charizard"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].externalId").value("base1-4"))
        .andExpect(jsonPath("$[0].name").value("Charizard"))
        .andExpect(jsonPath("$[0].cardGame").value("POKEMON"))
        .andExpect(jsonPath("$[0].setCode").value("base1"));
  }

  @Test
  void shouldReturnOneCardByExternalId() throws Exception {
    when(catalogSearchService.findByExternalId("magic", "alpha"))
        .thenReturn(new CatalogCardResponse(
            "alpha", "oracle", "Black Lotus", com.pitcc.model.CardGame.MAGIC_THE_GATHERING, null, "lea", "232", "rare", null));

    mockMvc.perform(get("/api/catalog/magic/cards/by-external-id").param("externalId", "alpha"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.externalId").value("alpha"))
        .andExpect(jsonPath("$.name").value("Black Lotus"));
  }

  @Test
  void shouldTranslateCatalogErrors() throws Exception {
    when(catalogSearchService.search("digimon", "x"))
        .thenThrow(new InvalidCatalogRequestException("Jogo desconhecido: digimon. Use pokemon, yugioh ou magic."));
    when(catalogSearchService.findByExternalId("yugioh", "missing"))
        .thenThrow(new CatalogCardNotFoundException());
    when(catalogSearchService.search("pokemon", "pikachu"))
        .thenThrow(new ExternalApiException(
            CardGame.POKEMON, ExternalApiErrorType.UNAVAILABLE, null, "Catalog unavailable for POKEMON", null));

    mockMvc.perform(get("/api/catalog/digimon/cards").param("q", "x"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Jogo desconhecido: digimon. Use pokemon, yugioh ou magic."));

    mockMvc.perform(get("/api/catalog/yugioh/cards/by-external-id").param("externalId", "missing"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Nenhuma carta encontrada para esse identificador."));

    mockMvc.perform(get("/api/catalog/pokemon/cards").param("q", "pikachu"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(jsonPath("$.message").value("O catálogo externo está indisponível."));
  }
}
