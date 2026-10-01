package com.pitcc.integration.catalog.yugioh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YugiohCardDto(
    Long id,
    String name,
    @JsonProperty("card_sets") List<YugiohCardSetDto> cardSets,
    @JsonProperty("card_images") List<YugiohCardImageDto> cardImages) {}
