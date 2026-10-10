package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgCardFaceDto(
        @JsonProperty("image_uris") MtgImageUris imageUris,
        @JsonProperty("mana_cost") String manaCost,
        @JsonProperty("type_line") String typeLine,
        List<String> colors,
        String power,
        String toughness,
        @JsonProperty("oracle_text") String oracleText
) {
    public MtgCardFaceDto(MtgImageUris imageUris) {
        this(imageUris, null, null, null, null, null, null);
    }
}
