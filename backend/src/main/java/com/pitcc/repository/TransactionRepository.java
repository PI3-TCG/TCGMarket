package com.pitcc.repository;

import com.pitcc.model.Transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    Page<Transaction> findByBuyerIdOrderByCompletedAtDesc(String buyerId, Pageable pageable);

    Page<Transaction> findBySellerIdOrderByCompletedAtDesc(String sellerId, Pageable pageable);
}
