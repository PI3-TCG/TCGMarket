package com.pitcc.repository;

import com.pitcc.model.Transaction;
import com.pitcc.model.TransactionType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    Page<Transaction> findByTypeAndBuyerIdOrderByCompletedAtDesc(
            TransactionType type,
            String buyerId,
            Pageable pageable
    );

    Page<Transaction> findByTypeAndSellerIdOrderByCompletedAtDesc(
            TransactionType type,
            String sellerId,
            Pageable pageable
    );

    Page<Transaction> findByBuyerIdOrSellerIdOrderByCompletedAtDesc(
            String buyerId,
            String sellerId,
            Pageable pageable
    );

    Page<Transaction> findByTypeAndBuyerIdOrTypeAndSellerIdOrderByCompletedAtDesc(
            TransactionType buyerType,
            String buyerId,
            TransactionType sellerType,
            String sellerId,
            Pageable pageable
    );

    Optional<Transaction> findByTypeAndSourceId(TransactionType type, String sourceId);
}
