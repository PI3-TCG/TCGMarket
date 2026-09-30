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
    @JsonProperty("card_faces") List<MtgCardFaceDto> cardFaces) {}
