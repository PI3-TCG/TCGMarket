
package com.pitcc.repository;

import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdRepository extends MongoRepository<Ad, String> {

    boolean existsByCollectionItemIdAndStatus(
            String collectionItemId,
            AdStatus status
    );

    // Necessário para o gerenciamento da #62
    // e para as operações protegidas da #66.
    Optional<Ad> findByIdAndSellerId(
            String id,
            String sellerId
    );

    // Necessário para o Marketplace da #63.
    Page<Ad> findByStatusAndRemainingQuantityGreaterThan(
            AdStatus status,
            Integer remainingQuantity,
            Pageable pageable
    );

    Optional<Ad> findByIdAndStatusAndRemainingQuantityGreaterThan(
            String id,
            AdStatus status,
            Integer remainingQuantity
    );
}
