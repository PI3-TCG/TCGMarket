package com.pitcc.service;

import com.pitcc.integration.payment.PaymentGateway.GatewayPayment;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentStatus;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.PaymentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Aplica o resultado do gateway ao pagamento e ao pedido uma única vez.
 * Aprovado deixa o pedido {@code PAID} e dispara a conclusão da compra;
 * recusado, cancelado ou expirado
 * deixa {@code PAYMENT_FAILED} e libera a reserva dos exemplares.
 *
 * <p>O pedido é atualizado antes do pagamento: se o processo cair no meio,
 * o pagamento continua pendente e a próxima notificação ou reconciliação
 * termina o trabalho, já que cada passo é idempotente.
 */
@Service
public class PaymentResultService {

    private static final Logger log = LoggerFactory.getLogger(PaymentResultService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AdPurchaseHoldRepository holdRepository;
    private final OrderCompletionService completionService;

    public PaymentResultService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            AdPurchaseHoldRepository holdRepository,
            OrderCompletionService completionService
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.holdRepository = holdRepository;
        this.completionService = completionService;
    }

    public void apply(Payment payment, GatewayPayment result) {
        Instant now = Instant.now();

        if (result.providerPaymentId() != null) {
            payment.registerProviderPayment(result.providerPaymentId(), now);
        }

        if (!result.status().isFinal()) {
            paymentRepository.save(payment);
            return;
        }

        if (payment.getStatus() == result.status()) {
            return;
        }

        if (payment.getStatus().isFinal()) {
            log.warn("Pagamento {} já finalizado como {}; ignorando {}.",
                    payment.getId(), payment.getStatus(), result.status());
            return;
        }

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new IllegalStateException(
                        "Pedido " + payment.getOrderId() + " do pagamento não encontrado."
                ));

        boolean approved = result.status() == PaymentStatus.APPROVED;
        boolean changed = approved ? order.markPaid(now) : order.markPaymentFailed(now);
        if (changed) {
            orderRepository.save(order);
        }

        if (!approved) {
            for (OrderItem item : order.getItems()) {
                holdRepository.release(item.getAdId(), order.getId());
            }
        }

        payment.resolve(result.status(), result.statusDetail(), now);
        paymentRepository.save(payment);

        if (approved) {
            completionService.completeQuietly(order.getId());
        }
    }
}
