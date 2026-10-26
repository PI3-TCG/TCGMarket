package com.pitcc.repository;

import com.pitcc.model.Checkout;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CheckoutRepository extends MongoRepository<Checkout, String> {

    Optional<Checkout> findByBuyerIdAndIdempotencyKey(String buyerId, String idempotencyKey);
}
