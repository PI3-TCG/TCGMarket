package com.pitcc.integration.catalog.yugioh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YugiohCardImageDto(
    @JsonProperty("image_url") String imageUrl,
    @JsonProperty("image_url_small") String imageUrlSmall) {}
