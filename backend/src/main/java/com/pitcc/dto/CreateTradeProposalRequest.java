package com.pitcc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Identidades de participantes e atributos de cartas sao resolvidos pelo backend. */
public record CreateTradeProposalRequest(
        @NotBlank(message = "Selecione um anuncio.")
        String adId,

        @NotNull(message = "Informe a quantidade solicitada.")
        @Min(value = 1, message = "A quantidade solicitada deve ser positiva.")
        Integer requestedQuantity,

        @NotEmpty(message = "Selecione ao menos uma carta para oferecer.")
        @Size(max = 30, message = "Selecione no maximo 30 itens por proposta.")
        List<@NotNull @Valid TradeOfferedItemRequest> offeredItems,

        @Valid TradeFinancialAdjustmentRequest financialAdjustment,

        // Opcional, enviado uma vez pelo frontend para evitar duplicacao ao reenviar.
        @Size(max = 100, message = "A chave de envio e muito longa.")
        String requestKey
) {
}
