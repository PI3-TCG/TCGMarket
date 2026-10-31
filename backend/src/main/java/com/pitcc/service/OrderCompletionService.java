package com.pitcc.service;

import com.pitcc.model.Ad;
import com.pitcc.model.Cart;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.OrderStatus;
import com.pitcc.model.Transaction;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CartRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.CollectionTransferRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.TransactionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Conclui um pedido pago: tira os exemplares do vendedor, baixa o anúncio,
 * entrega ao comprador, registra a transação e marca o pedido como concluído.
 *
 * <p>Não há transação multi-documento: cada passo é condicional e marcado
 * com {@code pedido:anúncio}, então repetir a conclusão não duplica nada. Se
 * um passo falhar, o pedido continua {@code PAID} e o
 * {@link OrderCompletionJob} tenta de novo, registrando o erro em log.
 */
@Service
public class OrderCompletionService {

    private static final Logger log = LoggerFactory.getLogger(OrderCompletionService.class);
    private static final int CART_ATTEMPTS = 3;

    private final OrderRepository orderRepository;
    private final AdRepository adRepository;
    private final AdPurchaseHoldRepository holdRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final CollectionTransferRepository transferRepository;
    private final TransactionRepository transactionRepository;
    private final CartRepository cartRepository;

    public OrderCompletionService(
            OrderRepository orderRepository,
            AdRepository adRepository,
            AdPurchaseHoldRepository holdRepository,
            CollectionItemRepository collectionItemRepository,
            CollectionTransferRepository transferRepository,
            TransactionRepository transactionRepository,
            CartRepository cartRepository
    ) {
        this.orderRepository = orderRepository;
        this.adRepository = adRepository;
        this.holdRepository = holdRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.cartRepository = cartRepository;
    }

    /** Conclui sem propagar falhas; o job tenta de novo. */
    public void completeQuietly(String orderId) {
        try {
            complete(orderId);
        } catch (RuntimeException exception) {
            log.error("Pedido {} pago, mas não concluído: {}", orderId, exception.getMessage());
        }
    }

    public void complete(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Pedido " + orderId + " não encontrado."));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            return;
        }
        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Só pedidos pagos podem ser concluídos.");
        }

        Instant now = Instant.now();

        for (OrderItem item : order.getItems()) {
            transfer(order, item, now);
        }

        try {
            transactionRepository.insert(Transaction.fromPaidOrder(order, now));
        } catch (DuplicateKeyException alreadyRecorded) {
            // A transação deste pedido já foi registrada numa tentativa anterior.
        }

        removeFromCart(order, now);

        if (order.complete(now)) {
            orderRepository.save(order);
        }
    }

    private void transfer(Order order, OrderItem item, Instant now) {
        String mark = order.getId() + ":" + item.getAdId();

        if (!transferRepository.debitSeller(
                item.getCollectionItemId(), order.getSellerId(), item.getAdId(),
                item.getQuantity(), mark, now)) {
            requireDebited(order, item, mark);
        }

        if (holdRepository.consume(item.getAdId(), order.getId(), item.getQuantity(), now)) {
            holdRepository.markSoldOutIfEmpty(item.getAdId(), now);
        } else if (holdOf(order, item)) {
            throw new IllegalStateException(
                    "Anúncio " + item.getAdId() + " sem quantidade para a reserva do pedido.");
        }

        transferRepository.closeEmptyReservation(item.getCollectionItemId(), item.getAdId(), now);
        transferRepository.deleteIfEmpty(item.getCollectionItemId());

        transferRepository.creditBuyer(
                order.getBuyerId(),
                item.getCard().getCardId(),
                item.getCard().getCondition(),
                item.getCard().getLanguage(),
                item.getQuantity(),
                mark
        );
    }

    // O débito não aplicou: ou já foi feito antes, ou a coleção do vendedor está inconsistente.
    private void requireDebited(Order order, OrderItem item, String mark) {
        boolean debited = collectionItemRepository.findById(item.getCollectionItemId())
                .map(seller -> seller.getAppliedTransfers().contains(mark))
                // Item removido por ter zerado: só acontece depois de consumir a reserva.
                .orElseGet(() -> !holdOf(order, item));

        if (!debited) {
            throw new IllegalStateException(
                    "Coleção do vendedor sem exemplares ou reserva ativa para o anúncio "
                            + item.getAdId() + ".");
        }
    }

    private boolean holdOf(Order order, OrderItem item) {
        return adRepository.findById(item.getAdId())
                .map(Ad::getPurchaseHolds)
                .orElse(List.of())
                .stream()
                .anyMatch(hold -> hold.getOrderId().equals(order.getId()));
    }

    private void removeFromCart(Order order, Instant now) {
        List<String> adIds = order.getItems().stream().map(OrderItem::getAdId).toList();

        for (int attempt = 0; attempt < CART_ATTEMPTS; attempt++) {
            Cart cart = cartRepository.findByUserId(order.getBuyerId()).orElse(null);
            if (cart == null) {
                return;
            }
            cart.removePurchased(adIds, now);
            try {
                cartRepository.save(cart);
                return;
            } catch (OptimisticLockingFailureException concurrentEdit) {
                // O comprador mexeu no carrinho ao mesmo tempo; relê e tenta de novo.
            }
        }

        log.warn("Itens do pedido {} não saíram do carrinho do comprador.", order.getId());
    }
}
