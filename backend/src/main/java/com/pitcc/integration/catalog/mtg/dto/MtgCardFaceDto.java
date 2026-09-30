package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgCardFaceDto(@JsonProperty("image_uris") MtgImageUris imageUris) {}
