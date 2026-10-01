package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgImageUris(String small, String normal) {}
