package com.pitcc.integration.catalog.yugioh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YugiohCardDto(
        Long id,
        String name,
        String type,
        String race,
        String attribute,
        Integer atk,
        Integer def,
        Integer level,
        @JsonProperty("linkval") Integer linkVal,
        @JsonProperty("card_sets") List<YugiohCardSetDto> cardSets,
        @JsonProperty("card_images") List<YugiohCardImageDto> cardImages
) {
    // Mantém os testes existentes que instanciam o DTO com quatro argumentos.
    public YugiohCardDto(Long id, String name, List<YugiohCardSetDto> cardSets,
                         List<YugiohCardImageDto> cardImages) {
        this(id, name, null, null, null, null, null, null, null, cardSets, cardImages);
    }
}
