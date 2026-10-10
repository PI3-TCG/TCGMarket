package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgCardDto(
        String id,
        @JsonProperty("oracle_id") String oracleId,
        String name,
        @JsonProperty("set") String setCode,
        @JsonProperty("set_name") String setName,
        @JsonProperty("collector_number") String cardNumber,
        String rarity,
        @JsonProperty("image_uris") MtgImageUris imageUris,
        @JsonProperty("card_faces") List<MtgCardFaceDto> cardFaces,
        @JsonProperty("mana_cost") String manaCost,
        Double cmc,
        List<String> colors,
        @JsonProperty("type_line") String typeLine,
        String power,
        String toughness,
        @JsonProperty("oracle_text") String oracleText
) {
    // Preserva os testes e usos anteriores do DTO.
    public MtgCardDto(String id, String oracleId, String name, String setCode,
                      String setName, String cardNumber, String rarity,
                      MtgImageUris imageUris, List<MtgCardFaceDto> cardFaces) {
        this(id, oracleId, name, setCode, setName, cardNumber, rarity,
                imageUris, cardFaces, null, null, null, null, null, null, null);
    }
}
