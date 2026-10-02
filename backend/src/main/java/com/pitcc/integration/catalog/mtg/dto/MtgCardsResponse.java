package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgCardsResponse(List<MtgCardDto> data) {}
