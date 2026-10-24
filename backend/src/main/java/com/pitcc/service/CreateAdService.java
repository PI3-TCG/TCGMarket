package com.pitcc.service;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.dto.CreateAdRequest;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
public class CreateAdService {

    private final CollectionItemRepository collectionItemRepository;
    private final AdRepository adRepository;
    private final AdAvailabilityService adAvailabilityService;

    public CreateAdService(
            CollectionItemRepository collectionItemRepository,
            AdRepository adRepository,
            AdAvailabilityService adAvailabilityService
    ) {
        this.collectionItemRepository = collectionItemRepository;
        this.adRepository = adRepository;
        this.adAvailabilityService = adAvailabilityService;
    }

    public AdResponse createAd(String userId, CreateAdRequest request) {
        // 1. Validar a autenticação
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        // 2. O item precisa ser da coleção do usuário autenticado.
        // Item de outro usuário responde como inexistente.
        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(request.collectionItemId(), userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        // 3. Validar modalidades e preço
        boolean sale = Boolean.TRUE.equals(request.saleEnabled());
        boolean trade = Boolean.TRUE.equals(request.tradeEnabled());

        if (!sale && !trade) {
            throw new InvalidAdException("modality", "Selecione uma modalidade.");
        }

        if (sale && request.unitPrice() == null) {
            throw new InvalidAdException("unitPrice", "Informe o preço por unidade.");
        }

        BigDecimal unitPrice = sale
                ? request.unitPrice().setScale(2, RoundingMode.UNNECESSARY)
                : null;

        // 4. Venda e troca compartilham a mesma reserva
        CollectionItemAvailabilityResponse availability =
                adAvailabilityService.availabilityOf(item);

        if (request.quantity() > availability.availableQuantity()) {
            throw new AdQuantityUnavailableException(availability.availableQuantity());
        }

        // 5. Persistir o anúncio
        Ad ad = adRepository.save(new Ad(
                userId,
                item,
                request.quantity(),
                sale,
                trade,
                unitPrice,
                request.description(),
                Instant.now()
        ));

        CollectionItemAvailabilityResponse updated = new CollectionItemAvailabilityResponse(
                availability.totalQuantity(),
                availability.committedQuantity() + ad.getRemainingQuantity(),
                availability.availableQuantity() - ad.getRemainingQuantity()
        );

        return new AdResponse(
                ad.getId(),
                ad.getCollectionItemId(),
                ad.getStatus(),
                ad.getQuantity(),
                ad.getRemainingQuantity(),
                ad.isSaleEnabled(),
                ad.isTradeEnabled(),
                ad.getUnitPrice(),
                ad.getDescription(),
                ad.getCreatedAt(),
                updated
        );
    }
}
