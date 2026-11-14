package com.pitcc.repository;

import com.pitcc.model.Review;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByTransactionId(String transactionId);
}
