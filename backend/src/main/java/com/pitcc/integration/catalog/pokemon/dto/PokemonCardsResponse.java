package com.pitcc.integration.catalog.pokemon.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PokemonCardsResponse(List<PokemonCardDto> data) {}
