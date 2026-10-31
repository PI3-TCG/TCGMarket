package com.pitcc.service;

import static com.pitcc.service.PaymentFixtures.order;
import static com.pitcc.service.PaymentFixtures.payment;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.pitcc.integration.payment.PaymentGateway.GatewayPayment;
import com.pitcc.model.Order;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.PaymentRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentResultServiceTest {

  @Mock private PaymentRepository paymentRepository;
  @Mock private OrderRepository orderRepository;
  @Mock private AdPurchaseHoldRepository holdRepository;

  private PaymentResultService service;
  private Order order;
  private Payment payment;

  @BeforeEach
  void setUp() {
    service = new PaymentResultService(paymentRepository, orderRepository, holdRepository);
    order = order("order-1");
    payment = payment(order, PaymentProvider.SIMULATED);
    lenient().when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
  }

  @Test
  void approvedPaymentMarksOrderPaidAndKeepsHolds() {
    service.apply(payment, new GatewayPayment("sim-1", PaymentStatus.APPROVED, "accredited"));

    assertEquals(OrderStatus.PAID, order.getStatus());
    assertEquals(PaymentStatus.APPROVED, payment.getStatus());
    assertEquals("sim-1", payment.getProviderPaymentId());
    verify(orderRepository).save(order);
    verify(paymentRepository).save(payment);
    verifyNoInteractions(holdRepository);
  }

  @Test
  void rejectedPaymentFailsOrderAndReleasesHolds() {
    service.apply(payment, new GatewayPayment("sim-1", PaymentStatus.REJECTED, "failed"));

    assertEquals(OrderStatus.PAYMENT_FAILED, order.getStatus());
    assertEquals(PaymentStatus.REJECTED, payment.getStatus());
    verify(holdRepository).release("ad-1", "order-1");
    verify(holdRepository).release("ad-2", "order-1");
  }

  @Test
  void pendingResultOnlyLinksProviderPayment() {
    service.apply(payment, new GatewayPayment("ORD01", PaymentStatus.PENDING, "waiting_transfer"));

    assertEquals(PaymentStatus.PENDING, payment.getStatus());
    assertEquals("ORD01", payment.getProviderPaymentId());
    assertEquals(OrderStatus.PENDING_PAYMENT, order.getStatus());
    verify(paymentRepository).save(payment);
    verifyNoInteractions(orderRepository, holdRepository);
  }

  @Test
  void repeatedResultHasNoEffect() {
    GatewayPayment approved = new GatewayPayment("sim-1", PaymentStatus.APPROVED, "accredited");
    service.apply(payment, approved);
    service.apply(payment, approved);

    verify(orderRepository).save(order);
    verify(paymentRepository).save(payment);
  }

  @Test
  void differentResultAfterFinalIsIgnored() {
    service.apply(payment, new GatewayPayment("sim-1", PaymentStatus.APPROVED, "accredited"));
    service.apply(payment, new GatewayPayment("sim-1", PaymentStatus.REJECTED, "failed"));

    assertEquals(PaymentStatus.APPROVED, payment.getStatus());
    assertEquals(OrderStatus.PAID, order.getStatus());
    verify(holdRepository, never()).release(any(), any());
  }

  @Test
  void finishesOrderAlreadyUpdatedBeforeACrash() {
    order.markPaid(java.time.Instant.now());

    service.apply(payment, new GatewayPayment("sim-1", PaymentStatus.APPROVED, "accredited"));

    assertEquals(PaymentStatus.APPROVED, payment.getStatus());
    verify(orderRepository, never()).save(any());
    verify(paymentRepository).save(payment);
  }
}
