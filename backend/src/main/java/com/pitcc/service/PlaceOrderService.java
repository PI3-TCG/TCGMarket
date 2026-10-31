package com.pitcc.service;

import com.pitcc.dto.CheckoutOrdersResponse;
import com.pitcc.dto.CheckoutOrdersResponse.OrderItemResponse;
import com.pitcc.dto.CheckoutOrdersResponse.OrderResponse;
import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.exception.AddressNotFoundException;
import com.pitcc.exception.CheckoutConflictException;
import com.pitcc.model.Ad;
import com.pitcc.model.Card;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.Cart;
import com.pitcc.model.CartItem;
import com.pitcc.model.Checkout;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.UserAddress;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;
import com.pitcc.repository.CheckoutRepository;
import com.pitcc.repository.OrderRepository;
import com.pitcc.repository.UserAddressRepository;
import com.pitcc.repository.UserRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Cria os pedidos (um por vendedor) a partir dos itens selecionados do carrinho
 * e reserva os exemplares até o resultado do pagamento. O carrinho e a
 * quantidade restante dos anúncios só mudam quando o pagamento é aprovado.
 *
 * <p>Se alguma reserva falhar, as reservas, os pedidos e o checkout criados são
 * desfeitos: nenhum pagamento foi iniciado, então o pedido nunca existiu para
 * o comprador.
 */
@Service
public class PlaceOrderService {

    private final CheckoutValidationService validationService;
    private final CheckoutRepository checkoutRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AdRepository adRepository;
    private final CardRepository cardRepository;
    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AdPurchaseHoldRepository holdRepository;

    public PlaceOrderService(
            CheckoutValidationService validationService,
            CheckoutRepository checkoutRepository,
            OrderRepository orderRepository,
            CartRepository cartRepository,
            AdRepository adRepository,
            CardRepository cardRepository,
            UserAddressRepository addressRepository,
            UserRepository userRepository,
            AdPurchaseHoldRepository holdRepository
    ) {
        this.validationService = validationService;
        this.checkoutRepository = checkoutRepository;
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.adRepository = adRepository;
        this.cardRepository = cardRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.holdRepository = holdRepository;
    }

    public CheckoutOrdersResponse placeOrder(String buyerId, String idempotencyKey, String addressId) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("A chave de idempotência é obrigatória.");
        }

        Optional<Checkout> existing = checkoutRepository.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        CheckoutValidationResponse validation = validationService.validate(buyerId);
        if (!validation.valid()) {
            throw new CheckoutConflictException(validation);
        }

        DeliveryAddress address = addressRepository.findByIdAndUserId(addressId, buyerId)
                .map(UserAddress::getAddress)
                .orElseThrow(AddressNotFoundException::new);

        List<CartItem> selected = cartRepository.findByUserId(buyerId)
                .map(Cart::selectedItems)
                .orElse(List.of());

        Map<String, Ad> ads = new HashMap<>();
        adRepository.findAllById(selected.stream().map(CartItem::getAdId).toList())
                .forEach(ad -> ads.put(ad.getId(), ad));

        Map<String, Card> cards = new HashMap<>();
        cardRepository.findAllById(ads.values().stream().map(Ad::getCardId).distinct().toList())
                .forEach(card -> cards.put(card.getId(), card));

        Map<String, List<OrderItem>> bySeller = new LinkedHashMap<>();
        for (CartItem item : selected) {
            Ad ad = ads.get(item.getAdId());
            Card card = cards.get(ad == null ? null : ad.getCardId());
            if (ad == null || card == null) {
                throw new CheckoutConflictException(validationService.validate(buyerId));
            }
            bySeller.computeIfAbsent(ad.getSellerId(), seller -> new ArrayList<>())
                    .add(toOrderItem(item, ad, card));
        }

        Instant now = Instant.now();
        Checkout checkout;
        try {
            checkout = checkoutRepository.save(new Checkout(buyerId, idempotencyKey, now));
        } catch (DuplicateKeyException duplicate) {
            return checkoutRepository.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey)
                    .map(this::toResponse)
                    .orElseThrow(() -> duplicate);
        }

        List<Order> orders = new ArrayList<>();
        try {
            for (Map.Entry<String, List<OrderItem>> entry : bySeller.entrySet()) {
                Order order = orderRepository.save(new Order(
                        checkout.getId(), buyerId, entry.getKey(), entry.getValue(), address, now
                ));
                orders.add(order);

                for (OrderItem item : order.getItems()) {
                    if (!holdRepository.reserve(item.getAdId(), order.getId(), item.getQuantity(), now)) {
                        rollback(checkout, orders);
                        throw new CheckoutConflictException(unavailable(buyerId, item));
                    }
                }
            }
        } catch (RuntimeException failure) {
            if (!(failure instanceof CheckoutConflictException)) {
                rollback(checkout, orders);
            }
            throw failure;
        }

        return toResponse(checkout, orders);
    }

    private static OrderItem toOrderItem(CartItem item, Ad ad, Card card) {
        CardSnapshot snapshot = new CardSnapshot(
                card.getId(),
                card.getName(),
                card.getGame(),
                card.getEdition(),
                card.getCardNumber(),
                card.getImageUrl(),
                ad.getCondition(),
                ad.getLanguage()
        );
        return new OrderItem(
                ad.getId(),
                ad.getCollectionItemId(),
                snapshot,
                item.getQuantity(),
                item.getAcceptedUnitPrice()
        );
    }

    private void rollback(Checkout checkout, List<Order> orders) {
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                holdRepository.release(item.getAdId(), order.getId());
            }
        }
        orderRepository.deleteAll(orders);
        checkoutRepository.delete(checkout);
    }

    // Outro comprador reservou os exemplares entre a validação e a reserva.
    private CheckoutValidationResponse unavailable(String buyerId, OrderItem item) {
        CheckoutValidationResponse validation = validationService.validate(buyerId);
        if (!validation.valid()) {
            return validation;
        }
        int available = adRepository.findById(item.getAdId()).map(Ad::availableForPurchase).orElse(0);
        ItemIssue issue = new ItemIssue(
                item.getAdId(),
                List.of(IssueCode.QUANTITY_UNAVAILABLE),
                item.getQuantity(),
                available,
                item.getUnitPrice(),
                item.getUnitPrice()
        );
        return new CheckoutValidationResponse(false, false, List.of(issue), List.of(), BigDecimal.ZERO);
    }

    private CheckoutOrdersResponse toResponse(Checkout checkout) {
        return toResponse(checkout, orderRepository.findByCheckoutId(checkout.getId()));
    }

    private CheckoutOrdersResponse toResponse(Checkout checkout, List<Order> orders) {
        Map<String, String> usernames = new HashMap<>();
        userRepository.findAllById(orders.stream().map(Order::getSellerId).distinct().toList())
                .forEach(user -> usernames.put(user.getId(), user.getUsername()));

        List<OrderResponse> responses = orders.stream()
                .map(order -> toOrderResponse(order, usernames.get(order.getSellerId())))
                .toList();
        BigDecimal total = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CheckoutOrdersResponse(checkout.getId(), responses, total);
    }

    private static OrderResponse toOrderResponse(Order order, String sellerUsername) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getAdId(),
                        item.getCard().getCardId(),
                        item.getCard().getName(),
                        item.getCard().getGame(),
                        item.getCard().getEdition(),
                        item.getCard().getCardNumber(),
                        item.getCard().getImageUrl(),
                        item.getCard().getCondition(),
                        item.getCard().getLanguage(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getSellerId(),
                sellerUsername,
                order.getStatus(),
                items,
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getCreatedAt()
        );
    }
}
