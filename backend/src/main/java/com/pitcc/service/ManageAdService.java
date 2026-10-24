package com.pitcc.service;

import com.pitcc.dto.CollectionCardResponse;
import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;

import com.pitcc.exception.AdNotActiveException;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;

import com.pitcc.model.Ad;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CollectionItem;

import com.pitcc.repository.AdRepository;
import com.pitcc.repository.AdReservationRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.OwnAdRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ManageAdService {

    private static final int MAX_PAGE_SIZE = 20;

    private final AdRepository adRepository;
    private final OwnAdRepository ownAdRepository;
    private final CardRepository cardRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final AdReservationRepository reservationRepository;

    public ManageAdService(
            AdRepository adRepository,
            OwnAdRepository ownAdRepository,
            CardRepository cardRepository,
            CollectionItemRepository collectionItemRepository,
            AdReservationRepository reservationRepository
    ) {
        this.adRepository = adRepository;
        this.ownAdRepository = ownAdRepository;
        this.cardRepository = cardRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.reservationRepository = reservationRepository;
    }

    public Page<OwnAdResponse> findOwnAds(
            String userId,
            int page,
            int size,
            OwnAdFilters filters
    ) {
        requireUser(userId);

        if (page < 0) {
            throw new IllegalArgumentException(
                    "A página não pode ser negativa."
            );
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 20."
            );
        }

        Page<Ad> ads = ownAdRepository.findOwnAds(
                userId,
                filters,
                PageRequest.of(page, size)
        );

        Set<String> cardIds = new HashSet<>();

        for (Ad ad : ads.getContent()) {
            cardIds.add(ad.getCardId());
        }

        Map<String, Card> cardsById = new HashMap<>();

        if (!cardIds.isEmpty()) {
            for (Card card : cardRepository.findAllById(cardIds)) {
                cardsById.put(card.getId(), card);
            }
        }

        return ads.map(
                ad -> toResponse(ad, cardsById.get(ad.getCardId()))
        );
    }

    public OwnAdResponse findOwnAd(
            String userId,
            String adId
    ) {
        requireUser(userId);
        return toResponse(findOwned(adId, userId));
    }

    public OwnAdResponse updateOwnAd(
            String userId,
            String adId,
            UpdateAdRequest request
    ) {
        requireUser(userId);

        if (request == null) {
            throw new InvalidAdException(
                    "request",
                    "Informe os dados da edição."
            );
        }

        boolean sale = Boolean.TRUE.equals(request.saleEnabled());
        boolean trade = Boolean.TRUE.equals(request.tradeEnabled());

        if (!sale && !trade) {
            throw new InvalidAdException(
                    "modality",
                    "Selecione uma modalidade."
            );
        }

        if (sale && request.unitPrice() == null) {
            throw new InvalidAdException(
                    "unitPrice",
                    "Informe o preço por unidade."
            );
        }

        BigDecimal unitPrice = sale
                ? request.unitPrice().setScale(
                2,
                RoundingMode.UNNECESSARY
        )
                : null;

        Ad current = findOwned(adId, userId);

        if (current.getStatus() != AdStatus.ACTIVE) {
            throw new AdNotActiveException(current.getStatus());
        }

        if (request.quantity() != null
                && current.getQuantity() != null
                && current.getRemainingQuantity() != null
                && current.getRemainingQuantity() >= 0
                && current.getQuantity() >= current.getRemainingQuantity()
                && request.quantity() <= current.getQuantity() - current.getRemainingQuantity()) {
            throw new InvalidAdException(
                    "quantity",
                    "A quantidade total deve ser maior que a quantidade já vendida."
            );
        }

        AdReservation reservation = findReservation(
                current.getCollectionItemId(),
                userId,
                adId
        );

        boolean reconciled = false;

        if (reservation.getStatus() == AdReservationStatus.PENDING_UPDATE) {
            confirmPreviouslyAppliedUpdate(userId, adId, current, reservation);
            current = findOwned(adId, userId);
            reservation = findReservation(
                    current.getCollectionItemId(),
                    userId,
                    adId
            );
            reconciled = true;
        }

        if (current.getStatus() != AdStatus.ACTIVE) {
            throw new AdNotActiveException(current.getStatus());
        }

        if (reservation.getStatus() != AdReservationStatus.ACTIVE) {
            throw new IllegalStateException(
                    "O anúncio possui uma operação pendente. "
                            + "É necessário reconciliar a reserva antes de editar."
            );
        }

        int currentTotal = current.getQuantity();
        int currentRemaining = current.getRemainingQuantity();

        if (currentRemaining <= 0 || currentTotal < currentRemaining) {
            throw new IllegalStateException(
                    "O anúncio possui quantidades inconsistentes."
            );
        }

        if (reservation.getQuantity() != currentRemaining) {
            throw new IllegalStateException(
                    "A quantidade do anúncio diverge da reserva. "
                            + "É necessário reconciliar antes de editar."
            );
        }

        int soldQuantity = currentTotal - currentRemaining;

        int targetTotal = request.quantity() == null
                ? currentTotal
                : request.quantity();

        if (targetTotal <= soldQuantity) {
            throw new InvalidAdException(
                    "quantity",
                    "A quantidade total deve ser maior que a quantidade já vendida."
            );
        }

        int targetRemaining = targetTotal - soldQuantity;

        if (reconciled
                && targetTotal == currentTotal
                && sale == current.isSaleEnabled()
                && trade == current.isTradeEnabled()
                && samePrice(unitPrice, current.getUnitPrice())) {
            return toResponse(current);
        }

        String operationId = UUID.randomUUID().toString();

        boolean prepared = reservationRepository.beginUpdate(
                current.getCollectionItemId(),
                userId,
                adId,
                operationId,
                currentRemaining,
                targetRemaining,
                sale,
                trade,
                unitPrice
        );

        if (!prepared) {
            reportUpdatePreparationFailure(
                    current,
                    userId,
                    currentRemaining,
                    targetRemaining,
                    adId
            );
        }

        Ad updated;

        try {
            updated = ownAdRepository
                    .updateQuantityIfActive(
                            adId,
                            userId,
                            currentTotal,
                            currentRemaining,
                            targetTotal,
                            targetRemaining,
                            sale,
                            trade,
                            unitPrice,
                            operationId,
                            Instant.now()
                    )
                    .orElse(null);
        } catch (RuntimeException exception) {
            throw new IllegalStateException(
                    "Não foi possível confirmar a atualização do anúncio. "
                            + "A reserva permanece pendente e exige reconciliação.",
                    exception
            );
        }

        if (updated == null) {
            boolean aborted;

            try {
                aborted = reservationRepository.abortUpdate(
                        current.getCollectionItemId(),
                        userId,
                        adId,
                        operationId,
                        currentRemaining,
                        targetRemaining
                );
            } catch (RuntimeException exception) {
                throw new IllegalStateException(
                        "A atualização do anúncio não foi aplicada, "
                                + "mas a reserva não pôde ser revertida. "
                                + "É necessária reconciliação.",
                        exception
                );
            }

            if (!aborted) {
                throw new IllegalStateException(
                        "A atualização do anúncio não foi aplicada, "
                                + "mas a reserva permanece pendente de reconciliação."
                );
            }

            Ad latest = findOwned(adId, userId);

            if (latest.getStatus() != AdStatus.ACTIVE) {
                throw new AdNotActiveException(latest.getStatus());
            }

            throw new IllegalStateException(
                    "O anúncio foi alterado durante a edição. "
                            + "Consulte os dados atuais e tente novamente."
            );
        }

        boolean confirmed;

        try {
            confirmed = reservationRepository.confirmUpdate(
                    current.getCollectionItemId(),
                    userId,
                    adId,
                    operationId,
                    currentRemaining,
                    targetRemaining,
                    sale,
                    trade,
                    unitPrice
            );
        } catch (RuntimeException exception) {
            throw new IllegalStateException(
                    "O anúncio foi atualizado, mas a confirmação "
                            + "da reserva exige reconciliação.",
                    exception
            );
        }

        if (!confirmed) {
            throw new IllegalStateException(
                    "O anúncio foi atualizado, mas a reserva "
                            + "não pôde ser confirmada. "
                            + "É necessária reconciliação."
            );
        }

        return toResponse(updated);
    }

    private void confirmPreviouslyAppliedUpdate(
            String userId,
            String adId,
            Ad ad,
            AdReservation reservation
    ) {
        String operationId = reservation.getPendingOperationId();
        Integer targetQuantity = reservation.getPendingQuantity();
        Boolean sale = reservation.getPendingSaleEnabled();
        Boolean trade = reservation.getPendingTradeEnabled();
        BigDecimal price = reservation.getPendingUnitPrice();

        if (operationId == null || operationId.isBlank()
                || targetQuantity == null || targetQuantity <= 0
                || sale == null || trade == null
                || (!sale && !trade)
                || (sale && (price == null || price.signum() <= 0))) {
            throw new IllegalStateException(
                    "Os dados da edição pendente estão incompletos."
            );
        }

        if (!operationId.equals(ad.getLastAppliedUpdateOperationId())) {
            throw new IllegalStateException(
                    "A edição pendente não foi comprovadamente aplicada. "
                            + "A reserva permanece protegida."
            );
        }

        if (ad.getStatus() != AdStatus.ACTIVE
                || !targetQuantity.equals(ad.getRemainingQuantity())
                || ad.getQuantity() == null
                || ad.getQuantity() < targetQuantity
                || ad.isSaleEnabled() != sale
                || ad.isTradeEnabled() != trade
                || !samePrice(ad.getUnitPrice(), sale ? price : null)) {
            throw new IllegalStateException(
                    "Os dados do anúncio divergem da edição pendente. "
                            + "A reserva permanece protegida."
            );
        }

        boolean confirmed = reservationRepository.confirmUpdate(
                ad.getCollectionItemId(),
                userId,
                adId,
                operationId,
                reservation.getQuantity(),
                targetQuantity,
                sale,
                trade,
                price
        );

        if (!confirmed) {
            throw new IllegalStateException(
                    "A edição pendente mudou durante a confirmação. "
                            + "Consulte o estado atual antes de editar."
            );
        }
    }

    private static boolean samePrice(BigDecimal first, BigDecimal second) {
        if (first == null || second == null) {
            return first == null && second == null;
        }

        return first.compareTo(second) == 0;
    }

    private void reportUpdatePreparationFailure(
            Ad current,
            String userId,
            int currentRemaining,
            int targetRemaining,
            String adId
    ) {
        CollectionItem latestItem = collectionItemRepository
                .findByIdAndUserId(
                        current.getCollectionItemId(),
                        userId
                )
                .orElseThrow(() -> new IllegalStateException(
                        "Item da coleção não encontrado durante a edição."
                ));

        int additionalQuantity = Math.max(
                0,
                targetRemaining - currentRemaining
        );

        Integer committed = latestItem.getCommittedQuantity();

        if (committed == null) {
            throw new IllegalStateException(
                    "A coleção possui quantidade comprometida inválida."
            );
        }

        int available = latestItem.getQuantity() - committed;

        if (available < 0) {
            throw new IllegalStateException(
                    "A coleção possui quantidades inconsistentes."
            );
        }

        if (additionalQuantity > available) {
            throw new AdQuantityUnavailableException(available);
        }

        throw new IllegalStateException(
                "Não foi possível preparar a edição do anúncio "
                        + adId
                        + ". Os dados podem ter mudado ou existe "
                        + "outra operação em andamento."
        );
    }

    public OwnAdResponse cancelOwnAd(
            String userId,
            String adId
    ) {
        requireUser(userId);

        Ad ad = findOwned(adId, userId);

        if (ad.getStatus() != AdStatus.ACTIVE
                && ad.getStatus() != AdStatus.CANCELLED) {
            throw new AdNotActiveException(ad.getStatus());
        }

        AdReservation reservation = findReservation(
                ad.getCollectionItemId(),
                userId,
                adId
        );

        if (reservation.getStatus() == AdReservationStatus.CANCELLED) {
            if (ad.getStatus() == AdStatus.CANCELLED) {
                return toResponse(ad);
            }

            throw new IllegalStateException(
                    "Reserva cancelada, mas o anúncio continua ativo."
            );
        }

        if (reservation.getQuantity() != ad.getRemainingQuantity()) {
            throw new IllegalStateException(
                    "A quantidade do anúncio diverge da reserva. "
                            + "É necessário reconciliar antes de cancelar."
            );
        }

        AdReservationStatus reservationStatus =
                reservation.getStatus();

        if (ad.getStatus() == AdStatus.ACTIVE
                && reservationStatus == AdReservationStatus.ACTIVE) {

            boolean started = reservationRepository.beginCancellation(
                    ad.getCollectionItemId(),
                    userId,
                    adId
            );

            if (started) {
                reservationStatus =
                        AdReservationStatus.PENDING_CANCELLATION;
            } else {
                reservationStatus = findReservation(
                        ad.getCollectionItemId(),
                        userId,
                        adId
                ).getStatus();
            }
        }

        if (reservationStatus !=
                AdReservationStatus.PENDING_CANCELLATION) {

            if (reservationStatus == AdReservationStatus.CANCELLED) {
                Ad latestAd = findOwned(adId, userId);

                if (latestAd.getStatus() == AdStatus.CANCELLED) {
                    return toResponse(latestAd);
                }
            }

            throw new IllegalStateException(
                    "A reserva não está preparada para cancelamento."
            );
        }

        Ad cancelled;

        if (ad.getStatus() == AdStatus.CANCELLED) {
            cancelled = ad;
        } else {
            cancelled = ownAdRepository
                    .cancelIfActive(
                            adId,
                            userId,
                            Instant.now()
                    )
                    .orElseGet(() -> {
                        Ad latest = findOwned(adId, userId);

                        if (latest.getStatus() == AdStatus.CANCELLED) {
                            return latest;
                        }

                        throw new AdNotActiveException(
                                latest.getStatus()
                        );
                    });
        }

        if (reservation.getQuantity()
                != cancelled.getRemainingQuantity()) {

            throw new IllegalStateException(
                    "Quantidade alterada durante o cancelamento. "
                            + "A reserva permanece comprometida."
            );
        }

        boolean released = reservationRepository.release(
                cancelled.getCollectionItemId(),
                userId,
                adId,
                cancelled.getRemainingQuantity(),
                AdReservationStatus.PENDING_CANCELLATION
        );

        if (!released) {
            AdReservation latestReservation = findReservation(
                    cancelled.getCollectionItemId(),
                    userId,
                    adId
            );

            if (latestReservation.getStatus()
                    != AdReservationStatus.CANCELLED) {

                throw new IllegalStateException(
                        "Anúncio cancelado, mas a liberação "
                                + "da reserva exige reconciliação."
                );
            }
        }

        return toResponse(cancelled);
    }

    private AdReservation findReservation(
            String collectionItemId,
            String userId,
            String adId
    ) {
        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(collectionItemId, userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Item da coleção não encontrado "
                                + "para reconciliar a reserva."
                ));

        if (item.getAdReservations() == null) {
            throw new IllegalStateException(
                    "O item não possui reservas registradas."
            );
        }

        return item.getAdReservations()
                .stream()
                .filter(reservation ->
                        adId.equals(reservation.getAdId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Reserva do anúncio não encontrada."
                ));
    }

    private RuntimeException notActiveOrMissing(
            String adId,
            String userId
    ) {
        Ad current = findOwned(adId, userId);
        return new AdNotActiveException(current.getStatus());
    }

    private Ad findOwned(
            String adId,
            String userId
    ) {
        return (Ad) adRepository
                .findByIdAndSellerId(adId, userId)
                .orElseThrow(AdNotFoundException::new);
    }

    private OwnAdResponse toResponse(Ad ad) {
        Card card = cardRepository
                .findById(ad.getCardId())
                .orElse(null);

        return toResponse(ad, card);
    }

    private OwnAdResponse toResponse(
            Ad ad,
            Card card
    ) {
        if (card == null) {
            throw new IllegalStateException(
                    "Um anúncio referencia uma carta inexistente."
            );
        }

        CollectionCardResponse cardResponse =
                new CollectionCardResponse(
                        card.getId(),
                        card.getName(),
                        card.getGame(),
                        card.getEdition(),
                        card.getCardNumber(),
                        card.getOfficialRarity(),
                        card.getImageUrl()
                );

        Integer released = ad.getStatus() == AdStatus.CANCELLED
                ? ad.getRemainingQuantity()
                : null;

        return new OwnAdResponse(
                ad.getId(),
                ad.getCollectionItemId(),
                ad.getStatus(),
                ad.getQuantity(),
                ad.getRemainingQuantity(),
                ad.isSaleEnabled(),
                ad.isTradeEnabled(),
                ad.getUnitPrice(),
                ad.getCondition(),
                ad.getLanguage(),
                cardResponse,
                ad.getCreatedAt(),
                ad.getUpdatedAt(),
                ad.getCancelledAt(),
                released
        );
    }

    private static void requireUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }
    }
}
