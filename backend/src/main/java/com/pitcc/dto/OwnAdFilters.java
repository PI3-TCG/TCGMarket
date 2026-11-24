package com.pitcc.dto;

import com.pitcc.model.AdModality;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardGame;

public record OwnAdFilters(
        String search,
        CardGame game,
        AdModality modality,
        AdStatus status,
        ListingSort sort
) {

    public OwnAdFilters(String search, CardGame game, AdModality modality, AdStatus status) {
        this(search, game, modality, status, ListingSort.RECENT);
    }

    public OwnAdFilters {
        sort = sort == null ? ListingSort.RECENT : sort;
        search = search == null || search.isBlank() ? null : search.trim();
    }

    public boolean hasCardFilters() {
        return search != null || game != null;
    }
}
