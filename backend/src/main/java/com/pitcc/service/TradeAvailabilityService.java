
package com.pitcc.service;

import com.pitcc.model.*;
import com.pitcc.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.pitcc.exception.TradeAvailabilityConflictException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TradeAvailabilityService {

    private final CollectionItemRepository collectionRepository;
    private final AdRepository adRepository;

    public TradeAvailabilityService(
            CollectionItemRepository collectionRepository,
            AdRepository adRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.adRepository = adRepository;
    }

    // Projeções temporárias da TradeProposal da #83.
    // Devem ser construídas a partir da proposta persistida.
    public record TradeLine(
            String collectionItemId,
            String cardId,
            CardCondition condition,
            CardLanguage language,
            String sourceAdId,
            int quantity
    ) {}

    public record TradeContext(
            String authenticatedUserId,
            String proposerId,
            String recipientId,
            String adId,
            String status,
            List<TradeLine> offeredItems,
            List<TradeLine> requestedItems
    ) {}

    public void validate(TradeContext proposal) {

        if (!"PENDING".equals(proposal.status())) {
            throw new TradeAvailabilityConflictException(
                    "A proposta não está mais pendente."
            );
        }

        if (!proposal.recipientId().equals(
                proposal.authenticatedUserId())) {
            throw new AccessDeniedException(
                    "Apenas o destinatário pode aceitar."
            );
        }

        if (proposal.proposerId().equals(proposal.recipientId())) {
            throw new TradeAvailabilityConflictException(
                    "Não é permitido negociar consigo mesmo."
            );
        }

        if (proposal.offeredItems() == null
                || proposal.offeredItems().isEmpty()
                || proposal.requestedItems() == null
                || proposal.requestedItems().isEmpty()) {
            throw new TradeAvailabilityConflictException(
                    "A proposta precisa conter cartas dos dois lados."
            );
        }

        Ad targetAd = adRepository.findById(proposal.adId())
                .orElseThrow(() -> new TradeAvailabilityConflictException(
                        "O anúncio não existe mais."
                ));

        if (targetAd.getStatus() != AdStatus.ACTIVE
                || !targetAd.isTradeEnabled()
                || targetAd.isCreationAborted()
                || !targetAd.getSellerId()
                .equals(proposal.recipientId())) {
            throw new TradeAvailabilityConflictException(
                    "O anúncio não está disponível para troca."
            );
        }

        boolean hasAnchor = proposal.requestedItems().stream()
                .anyMatch(line ->
                        proposal.adId().equals(line.sourceAdId())
                                && targetAd.getCollectionItemId()
                                .equals(line.collectionItemId())
                                && targetAd.getCardId()
                                .equals(line.cardId())
                );

        if (!hasAnchor) {
            throw new TradeAvailabilityConflictException(
                    "A proposta não contém a carta do anúncio."
            );
        }

        Map<String, Long> freeDemand = new HashMap<>();
        Map<String, Long> adDemand = new HashMap<>();

        validateSide(
                proposal.offeredItems(),
                proposal.proposerId(),
                freeDemand,
                adDemand
        );

        validateSide(
                proposal.requestedItems(),
                proposal.recipientId(),
                freeDemand,
                adDemand
        );

        // Esta é apenas a pré-validação.
        // Na próxima etapa será necessário fazer o bloqueio
        // atômico de TODAS as quantidades verificadas.
    }

    private void validateSide(
            List<TradeLine> lines,
            String expectedOwner,
            Map<String, Long> freeDemand,
            Map<String, Long> adDemand
    ) {
        for (TradeLine line : lines) {

            if (line.quantity() <= 0) {
                throw new TradeAvailabilityConflictException(
                        "A quantidade deve ser positiva."
                );
            }

            CollectionItem item = collectionRepository
                    .findByIdAndUserId(
                            line.collectionItemId(),
                            expectedOwner
                    )
                    .orElseThrow(() -> new TradeAvailabilityConflictException(
                            "A carta não pertence mais ao usuário."
                    ));

            if (!item.getCardId().equals(line.cardId())
                    || item.getCondition() != line.condition()
                    || item.getLanguage() != line.language()) {
                throw new TradeAvailabilityConflictException(
                        "Os dados da carta foram alterados."
                );
            }

            Integer total = item.getQuantity();
            Integer committed = item.getCommittedQuantity();

            if (total == null || committed == null
                    || total < 0 || committed < 0
                    || committed > total) {
                throw new TradeAvailabilityConflictException(
                        "A coleção possui quantidades inconsistentes."
                );
            }

            if (line.sourceAdId() == null) {
                long requested = freeDemand.merge(
                        item.getId(),
                        (long) line.quantity(),
                        Long::sum
                );

                if ((long) total - committed < requested) {
                    throw new TradeAvailabilityConflictException(
                            "Quantidade livre insuficiente na coleção."
                    );
                }
                continue;
            }

            Ad ad = adRepository.findById(line.sourceAdId())
                    .orElseThrow(() -> new TradeAvailabilityConflictException(
                            "Um anúncio não existe mais."
                    ));

            if (ad.getStatus() != AdStatus.ACTIVE
                    || !ad.isTradeEnabled()
                    || ad.isCreationAborted()
                    || !expectedOwner.equals(ad.getSellerId())
                    || !item.getId().equals(ad.getCollectionItemId())
                    || !item.getCardId().equals(ad.getCardId())
                    || item.getCondition() != ad.getCondition()
                    || item.getLanguage() != ad.getLanguage()
                    || ad.getRemainingQuantity() == null) {
                throw new TradeAvailabilityConflictException(
                        "O anúncio foi alterado ou está indisponível."
                );
            }

            boolean hasActiveReservation =
                    item.getAdReservations() != null
                            && item.getAdReservations().stream().anyMatch(r ->
                            ad.getId().equals(r.getAdId())
                                    && r.getStatus() == AdReservationStatus.ACTIVE
                                    && r.getQuantity() >= ad.getRemainingQuantity()
                    );

            if (!hasActiveReservation) {
                throw new TradeAvailabilityConflictException(
                        "A reserva do anúncio está inconsistente."
                );
            }

            long heldForPurchase = ad.getPurchaseHolds().stream()
                    .mapToLong(AdPurchaseHold::getQuantity)
                    .sum();

            long requested = adDemand.merge(
                    ad.getId(),
                    (long) line.quantity(),
                    Long::sum
            );

            long available = (long) ad.getRemainingQuantity()
                    - heldForPurchase;

            // PENDENTE: também descontar tradeHolds.

            if (requested > available) {
                throw new TradeAvailabilityConflictException(
                        "Quantidade indisponível no anúncio."
                );
            }
        }
    }
}
