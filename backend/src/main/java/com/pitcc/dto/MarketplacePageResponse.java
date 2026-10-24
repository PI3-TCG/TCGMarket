package com.pitcc.dto;

import java.util.List;

public record MarketplacePageResponse(
        List<MarketplaceAdResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}