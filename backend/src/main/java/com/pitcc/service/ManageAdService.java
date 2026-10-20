package com.pitcc.service;

import com.pitcc.dto.CollectionCardResponse;
import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;
import com.pitcc.exception.AdNotActiveException;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
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

@Service
public class ManageAdService {

    private static final int MAX_PAGE_SIZE = 20;

    private final AdRepository adRepository;
    private final OwnAdRepository ownAdRepository;
    private final CardRepository cardRepository;

    public ManageAdService(
            AdRepository adRepository,
            OwnAdRepository ownAdRepository,
            CardRepository cardRepository) {
        this.adRepository = adRepository;
        this.ownAdRepository = ownAdRepository;
        this.cardRepository = cardRepository;
    }

    public Page<OwnAdResponse> findOwnAds(String userId, int page, int size, OwnAdFilters filters) {
        requireUser(userId);

        if (page < 0) {
            throw new IllegalArgumentException("A página não pode ser negativa.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("O tamanho da página deve estar entre 1 e 20.");
        }

        Page<Ad> ads = ownAdRepository.findOwnAds(userId, filters, PageRequest.of(page, size));

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

        return ads.map(ad -> toResponse(ad, cardsById.get(ad.getCardId())));
    }

    public OwnAdResponse findOwnAd(String userId, String adId) {
        requireUser(userId);
        return toResponse(findOwned(adId, userId));
    }

    public OwnAdResponse updateOwnAd(String userId, String adId, UpdateAdRequest request) {
        requireUser(userId);

        boolean sale = Boolean.TRUE.equals(request.saleEnabled());
        boolean trade = Boolean.TRUE.equals(request.tradeEnabled());

        if (!sale && !trade) {
            throw new InvalidAdException("modality", "Selecione uma modalidade.");
        }

        if (sale && request.unitPrice() == null) {
            throw new InvalidAdException("unitPrice", "Informe o preço por unidade.");
        }

        // Anúncio só de troca não guarda preço.
        BigDecimal unitPrice = sale
                ? request.unitPrice().setScale(2, RoundingMode.UNNECESSARY)
                : null;

        Ad updated = ownAdRepository
                .updateIfActive(adId, userId, sale, trade, unitPrice, Instant.now())
                .orElseThrow(() -> notActiveOrMissing(adId, userId));

        return toResponse(updated);
    }

    public OwnAdResponse cancelOwnAd(String userId, String adId) {
        requireUser(userId);

        return ownAdRepository.cancelIfActive(adId, userId, Instant.now())
                .map(this::toResponse)
                .orElseGet(() -> {
                    Ad current = findOwned(adId, userId);

                    // Reenvio de um cancelamento já aplicado devolve o estado atual.
                    if (current.getStatus() == AdStatus.CANCELLED) {
                        return toResponse(current);
                    }

                    throw new AdNotActiveException(current.getStatus());
                });
    }

    private RuntimeException notActiveOrMissing(String adId, String userId) {
        Ad current = findOwned(adId, userId);
        return new AdNotActiveException(current.getStatus());
    }

    // Anúncio de outro usuário responde como inexistente.
    private Ad findOwned(String adId, String userId) {
        return adRepository.findByIdAndSellerId(adId, userId)
                .orElseThrow(AdNotFoundException::new);
    }

    private OwnAdResponse toResponse(Ad ad) {
        Card card = cardRepository.findById(ad.getCardId()).orElse(null);
        return toResponse(ad, card);
    }

    private OwnAdResponse toResponse(Ad ad, Card card) {
        if (card == null) {
            throw new IllegalStateException("Um anúncio referencia uma carta inexistente.");
        }

        CollectionCardResponse cardResponse = new CollectionCardResponse(
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
