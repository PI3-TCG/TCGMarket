package com.pitcc.service;

import com.pitcc.model.AdStatus;
import com.pitcc.repository.AdRepository;

import org.springframework.stereotype.Component;

@Component
public class MongoActiveAdLookup implements ActiveAdLookup {

    private final AdRepository adRepository;

    public MongoActiveAdLookup(AdRepository adRepository) {
        this.adRepository = adRepository;
    }

    @Override
    public boolean hasActiveAdFor(String collectionItemId) {
        return adRepository.existsByCollectionItemIdAndStatus(
                collectionItemId,
                AdStatus.ACTIVE
        );
    }
}
