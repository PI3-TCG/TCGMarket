
package com.pitcc.service;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.dto.CreateAdRequest;

import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;

import com.pitcc.model.Ad;
import com.pitcc.model.AdReservation;
import com.pitcc.model.CollectionItem;

import com.pitcc.repository.AdRepository;
import com.pitcc.repository.AdReservationRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
public class CreateAdService {

    private final CollectionItemRepository collectionItemRepository;
    private final AdRepository adRepository;
    private final AdReservationRepository reservationRepository;

    public CreateAdService(
            CollectionItemRepository collectionItemRepository,
            AdRepository adRepository,
            AdReservationRepository reservationRepository
    ) {
        this.collectionItemRepository = collectionItemRepository;
        this.adRepository = adRepository;
        this.reservationRepository = reservationRepository;
    }

    public AdResponse createAd(
            String userId,
            CreateAdRequest request
    ) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(
                        request.collectionItemId(),
                        userId
                )
                .orElseThrow(CollectionItemNotFoundException::new);

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

        String adId = UUID.randomUUID().toString();
        Instant now = Instant.now();

        Ad newAd = new Ad(
                adId,
                userId,
                item,
                request.quantity(),
                sale,
                trade,
                unitPrice,
                now
        );

        AdReservation reservation = new AdReservation(
                adId,
                request.quantity(),
                sale,
                trade,
                unitPrice,
                now
        );

        boolean reserved = reservationRepository.reserve(
                item.getId(),
                userId,
                reservation
        );

        if (!reserved) {
            CollectionItem current = collectionItemRepository
                    .findByIdAndUserId(
                            item.getId(),
                            userId
                    )
                    .orElseThrow(CollectionItemNotFoundException::new);

            Integer committedQuantity =
                    current.getCommittedQuantity();

            if (committedQuantity == null
                    || committedQuantity < 0
                    || committedQuantity > current.getQuantity()) {
                throw new IllegalStateException(
                        "Quantidade comprometida inconsistente."
                );
            }

            int available = current.getQuantity()
                    - committedQuantity;

            throw new AdQuantityUnavailableException(available);
        }

        Ad saved = adRepository.insert(newAd);

        boolean confirmed = reservationRepository.confirmCreation(
                item.getId(),
                userId,
                adId
        );

        if (!confirmed) {
            throw new IllegalStateException(
                    "Anúncio " + adId
                            + " persistido, mas a confirmação "
                            + "da reserva exige reconciliação."
            );
        }

        CollectionItem current = collectionItemRepository
                .findByIdAndUserId(
                        item.getId(),
                        userId
                )
                .orElseThrow(CollectionItemNotFoundException::new);

        int total = current.getQuantity();
        Integer committed = current.getCommittedQuantity();

        if (committed == null
                || committed < 0
                || committed > total) {
            throw new IllegalStateException(
                    "Quantidade comprometida inconsistente."
            );
        }

        CollectionItemAvailabilityResponse availability =
                new CollectionItemAvailabilityResponse(
                        total,
                        committed,
                        total - committed
                );

        return toResponse(saved, availability);
    }

    private AdResponse toResponse(
            Ad ad,
            CollectionItemAvailabilityResponse availability
    ) {
        return new AdResponse(
                ad.getId(),
                ad.getCollectionItemId(),
                ad.getStatus(),
                ad.getQuantity(),
                ad.getRemainingQuantity(),
                ad.isSaleEnabled(),
                ad.isTradeEnabled(),
                ad.getUnitPrice(),
                ad.getCreatedAt(),
                availability
        );
    }
}
