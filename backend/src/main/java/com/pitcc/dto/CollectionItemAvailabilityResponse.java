package com.pitcc.dto;

/**
 * Disponibilidade de um item da coleção para novos anúncios.
 * {@code committedQuantity} é a quantidade restante dos anúncios ativos.
 */
public record CollectionItemAvailabilityResponse(
        int totalQuantity,
        int committedQuantity,
        int availableQuantity
) {
}
