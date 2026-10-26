package com.pitcc.repository;

import com.pitcc.model.UserAddress;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends MongoRepository<UserAddress, String> {

    List<UserAddress> findByUserIdOrderByCreatedAtAsc(String userId);

    Optional<UserAddress> findByIdAndUserId(String id, String userId);

    long countByUserId(String userId);

    @Query("{ 'userId': ?0, 'primary': true, '_id': { '$ne': ?1 } }")
    @Update("{ '$set': { 'primary': false }, '$inc': { 'version': 1 } }")
    long clearPrimaryExcept(String userId, String keepId);
}
