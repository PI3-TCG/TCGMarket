package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;

import java.math.BigDecimal;

/**
 * Linha do carrinho com o estado atual do anúncio. {@code acceptedUnitPrice}
 * é o preço que o comprador aceitou; {@code currentUnitPrice} é o preço de
 * agora (nulo se o anúncio ficou indisponível).
 */
public record CartItemResponse(
        String adId,
        String cardId,
        String cardName,
        CardGame game,
        String edition,
        String imageUrl,
        CardCondition condition,
        CardLanguage language,
        int quantity,
        boolean selected,
        BigDecimal acceptedUnitPrice,
        BigDecimal currentUnitPrice,
        int availableQuantity,
        CartItemAvailability availability,
        boolean priceChanged
) {

    public enum CartItemAvailability {
        AVAILABLE,
        /** O anúncio continua à venda, mas com menos exemplares do que o pedido. */
        REDUCED,
        UNAVAILABLE
    }
}
