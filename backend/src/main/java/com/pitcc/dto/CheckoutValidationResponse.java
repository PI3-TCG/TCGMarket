package com.pitcc.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resultado da revalidação dos itens selecionados do carrinho antes do pedido.
 * {@code items} traz só as linhas que precisam de revisão; {@code sellers}
 * agrupa as linhas válidas, já que cada vendedor gera um pedido separado.
 */
public record CheckoutValidationResponse(
        boolean valid,
        boolean emptySelection,
        List<ItemIssue> items,
        List<SellerGroup> sellers,
        BigDecimal total
) {

    public record ItemIssue(
            String adId,
            List<IssueCode> issues,
            int requestedQuantity,
            int availableQuantity,
            BigDecimal acceptedUnitPrice,
            BigDecimal currentUnitPrice
    ) {
    }

    public record SellerGroup(
            String sellerId,
            List<String> adIds,
            BigDecimal subtotal
    ) {
    }

    public enum IssueCode {
        AD_NOT_FOUND,
        AD_CANCELLED,
        AD_SOLD_OUT,
        SALE_DISABLED,
        QUANTITY_UNAVAILABLE,
        PRICE_CHANGED,
        OWN_AD,
        SELLER_CHANGED,
        CARD_NOT_FOUND
    }
}
