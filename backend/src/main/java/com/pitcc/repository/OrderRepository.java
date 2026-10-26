package com.pitcc.repository;

import com.pitcc.model.Order;
import com.pitcc.model.OrderStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByCheckoutId(String checkoutId);

    Optional<Order> findByIdAndBuyerId(String id, String buyerId);

    /** Pedidos parados em um estado, para reconciliação. */
    List<Order> findByStatusAndUpdatedAtBefore(OrderStatus status, Instant updatedBefore);
}
