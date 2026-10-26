
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

    Optional<Ad> findByIdAndSellerId(String id, String sellerId);

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
