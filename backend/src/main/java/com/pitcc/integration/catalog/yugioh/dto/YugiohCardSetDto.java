package com.pitcc.integration.catalog.yugioh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YugiohCardSetDto(
    @JsonProperty("set_name") String setName,
    @JsonProperty("set_code") String setCode,
    @JsonProperty("set_rarity") String setRarity) {}
