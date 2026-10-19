package com.pitcc.repository;

import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdRepository extends MongoRepository<Ad, String> {

    boolean existsByCollectionItemIdAndStatus(String collectionItemId, AdStatus status);
}
