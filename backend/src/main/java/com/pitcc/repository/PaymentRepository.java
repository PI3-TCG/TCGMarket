package com.pitcc.repository;

import com.pitcc.model.Payment;
import com.pitcc.model.PaymentStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByProviderPaymentId(String providerPaymentId);

    /** Tentativas pendentes antigas, para consultar o gateway quando o webhook não chega. */
    List<Payment> findByStatusAndCreatedAtBefore(PaymentStatus status, Instant createdBefore);
}
