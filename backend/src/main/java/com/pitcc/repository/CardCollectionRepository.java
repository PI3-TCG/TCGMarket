package com.pitcc.repository;

import com.pitcc.model.CardCollection;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CardCollectionRepository extends MongoRepository<CardCollection, String> {

    List<CardCollection> findByUserIdOrderByCreatedAtAsc(String userId);

    Optional<CardCollection> findByIdAndUserId(String id, String userId);

    Optional<CardCollection> findByUserIdAndName(String userId, String name);

    List<CardCollection> findByUserIdAndVisibleTrueOrderByCreatedAtAsc(String userId);

    boolean existsByUserIdAndNameIgnoreCase(String userId, String name);
}
