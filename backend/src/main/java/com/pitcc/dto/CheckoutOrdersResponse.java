package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Pedidos criados por um checkout, um por vendedor, aguardando pagamento. */
public record CheckoutOrdersResponse(
        String checkoutId,
        List<OrderResponse> orders,
        BigDecimal total
) {

    public record OrderResponse(
            String id,
            String sellerId,
            String sellerUsername,
            OrderStatus status,
            List<OrderItemResponse> items,
            BigDecimal totalAmount,
            DeliveryAddress deliveryAddress,
            Instant createdAt
    ) {
    }

    public record OrderItemResponse(
            String adId,
            String cardId,
            String cardName,
            CardGame game,
            String edition,
            String cardNumber,
            String imageUrl,
            CardCondition condition,
            CardLanguage language,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
    }
}
