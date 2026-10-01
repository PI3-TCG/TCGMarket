package com.pitcc.integration.catalog.yugioh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YugiohCardsResponse(List<YugiohCardDto> data) {}
