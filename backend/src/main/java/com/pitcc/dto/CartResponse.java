package com.pitcc.dto;

import java.util.List;

/** {@code distinctItemCount} é o contador da navbar: anúncios distintos, não exemplares. */
public record CartResponse(
        List<CartItemResponse> items,
        int distinctItemCount
) {
}
