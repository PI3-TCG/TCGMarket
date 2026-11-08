package com.pitcc.integration.catalog.mtg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** Impressão não inglesa da Scryfall; {@code imageStatus} "placeholder" ou "missing" não é scan. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MtgLocalizedCardDto(
        @JsonProperty("oracle_id") String oracleId,
        @JsonProperty("set") String setCode,
        @JsonProperty("collector_number") String cardNumber,
        @JsonProperty("printed_name") String printedName,
        @JsonProperty("image_status") String imageStatus,
        @JsonProperty("image_uris") MtgImageUris imageUris,
        @JsonProperty("card_faces") List<Face> cardFaces
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Face(
            @JsonProperty("printed_name") String printedName,
            @JsonProperty("image_uris") MtgImageUris imageUris
    ) {}
}
