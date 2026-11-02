package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Transação vista por um dos participantes. O tipo é relativo a quem consulta:
 * a mesma venda é {@code PURCHASE} para o comprador e {@code SALE} para o vendedor.
 * Do outro participante só saem dados já públicos no perfil.
 */
public record TransactionHistoryResponse(
        String id,
        Type type,
        Status status,
        Instant completedAt,
        Counterparty counterparty,
        List<Item> items,
        int totalQuantity,
        BigDecimal totalAmount
) {

    public enum Type {
        PURCHASE,
        SALE
    }

    // Só transações concluídas são registradas; novos estados entram aqui.
    public enum Status {
        COMPLETED
    }

    public record Counterparty(String username, String name) {
    }

    public record Item(
            String cardId,
            String name,
            CardGame game,
            String edition,
            String cardNumber,
            String imageUrl,
            CardCondition condition,
            CardLanguage language,
            int quantity,
            BigDecimal unitPrice
    ) {
    }
}
