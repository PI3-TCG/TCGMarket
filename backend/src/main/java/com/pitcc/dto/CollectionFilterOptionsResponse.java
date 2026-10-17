package com.pitcc.dto;

import java.util.List;

public record CollectionFilterOptionsResponse(
        List<String> editions,
        List<String> rarities
) {
}