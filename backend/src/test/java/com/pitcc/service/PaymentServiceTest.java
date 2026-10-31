package com.pitcc.service;

import static com.pitcc.service.PaymentFixtures.BUYER;
import static com.pitcc.service.PaymentFixtures.order;
import static com.pitcc.service.PaymentFixtures.payment;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.integration.payment.PaymentGateway;
import com.pitcc.integration.payment.PaymentGateway.GatewayPayment;
import com.pitcc.integration.payment.PaymentGateway.PaymentRequest;
import com.pitcc.integration.payment.PaymentGatewayException;
import com.pitcc.model.Order;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;
import com.pitcc.model.User;
import com.pitcc.repository.PaymentRepository;
import com.pitcc.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

  @Mock private PaymentGateway gateway;
  @Mock private PaymentRepository paymentRepository;
  @Mock private UserRepository userRepository;
  @Mock private PaymentResultService resultService;

  private PaymentService service;

  @BeforeEach
  void setUp() {
    service = new PaymentService(gateway, paymentRepository, userRepository, resultService);
    User buyer = new User();
    buyer.setId(BUYER);
    buyer.setEmail("ana@test.com");
    lenient().when(userRepository.findById(BUYER)).thenReturn(Optional.of(buyer));
    lenient().when(gateway.provider()).thenReturn(PaymentProvider.MERCADO_PAGO);
    lenient().when(paymentRepository.save(any(Payment.class))).thenAnswer(call -> call.getArgument(0));
  }

  @Test
  void createsOnePaymentPerOrderAndAppliesTheResult() {
    Order first = order("order-1");
    Order second = order("order-2");
    GatewayPayment pending = new GatewayPayment("ORD01", PaymentStatus.PENDING, "waiting_transfer");
    when(gateway.create(any())).thenReturn(pending);

    service.startPayments(BUYER, List.of(first, second));

    ArgumentCaptor<PaymentRequest> requests = ArgumentCaptor.forClass(PaymentRequest.class);
    verify(gateway, times(2)).create(requests.capture());
    PaymentRequest request = requests.getAllValues().getFirst();
    assertEquals("order-1", request.orderId());
    assertEquals(0, new BigDecimal("25.00").compareTo(request.amount()));
    assertEquals("ana@test.com", request.payerEmail());
    verify(resultService, times(2)).apply(any(Payment.class), any());
  }

  @Test
  void keepsPaymentPendingWhenGatewayFails() {
    when(gateway.create(any())).thenThrow(new PaymentGatewayException("timeout"));

    service.startPayments(BUYER, List.of(order("order-1")));

    verify(paymentRepository).save(any(Payment.class));
    verifyNoInteractions(resultService);
  }

  @Test
  void skipsOrderThatAlreadyHasAPayment() {
    when(paymentRepository.save(any(Payment.class))).thenThrow(new DuplicateKeyException("dup"));

    service.startPayments(BUYER, List.of(order("order-1")));

    verify(gateway, never()).create(any());
  }

  @Test
  void reconcileResendsCreationWithTheSameKeyWhenNeverLinked() {
    Payment payment = payment(order("order-1"), PaymentProvider.MERCADO_PAGO);
    GatewayPayment approved = new GatewayPayment("ORD01", PaymentStatus.APPROVED, "accredited");
    when(gateway.create(any())).thenReturn(approved);

    service.reconcile(payment);

    ArgumentCaptor<PaymentRequest> request = ArgumentCaptor.forClass(PaymentRequest.class);
    verify(gateway).create(request.capture());
    assertEquals(payment.getIdempotencyKey(), request.getValue().idempotencyKey());
    verify(resultService).apply(payment, approved);
  }

  @Test
  void reconcileFetchesLinkedPayment() {
    Payment payment = payment(order("order-1"), PaymentProvider.MERCADO_PAGO);
    payment.registerProviderPayment("ORD01", java.time.Instant.now());
    GatewayPayment approved = new GatewayPayment("ORD01", PaymentStatus.APPROVED, "accredited");
    when(gateway.fetch("ORD01")).thenReturn(approved);

    service.reconcile(payment);

    verify(resultService).apply(payment, approved);
    verify(gateway, never()).create(any());
  }

  @Test
  void reconcileIgnoresPaymentsOfAnotherProvider() {
    service.reconcile(payment(order("order-1"), PaymentProvider.SIMULATED));

    verify(gateway, never()).create(any());
    verify(gateway, never()).fetch(any());
  }

  @Test
  void notificationForUnknownPaymentIsIgnored() {
    when(paymentRepository.findByProviderPaymentId("ORD99")).thenReturn(Optional.empty());

    service.handleNotification("ORD99");

    verify(gateway, never()).fetch(any());
  }
}
