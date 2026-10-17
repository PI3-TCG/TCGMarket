package com.pitcc.service;

import com.pitcc.dto.CollectionCardResponse;
import com.pitcc.dto.CollectionItemResponse;
import com.pitcc.model.Card;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.dto.CollectionSummaryResponse;
import com.pitcc.dto.CollectionFilters;
import com.pitcc.repository.CollectionSearchRepository;
import com.pitcc.dto.CollectionFilterOptionsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class CollectionService {

    //injeção de dependência
    private final CollectionItemRepository collectionItemRepository;
    private final CardRepository cardRepository;
    private final CollectionSearchRepository collectionSearchRepository;

    public CollectionService(
            CollectionItemRepository collectionItemRepository,
            CardRepository cardRepository,
            CollectionSearchRepository collectionSearchRepository) {

        this.collectionItemRepository = collectionItemRepository;
        this.cardRepository = cardRepository;
        this.collectionSearchRepository = collectionSearchRepository;
    }


    public Page<CollectionItemResponse> findOwnCollection(
            String userId,
            int page,
            int size,
            CollectionFilters filters) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário precisa ser informado.");
        }

        if (page < 0) {
            throw new IllegalArgumentException(
                    "A página não pode ser negativa.");
        }

        if (size < 1 || size > 20) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 20.");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "id")
        );

        Page<CollectionItem> items =
                collectionSearchRepository.findOwnCollection(
                        userId,
                        filters,
                        pageable
                );


        Set<String> cardIds = new HashSet<>();

        for (CollectionItem item : items.getContent()) {
            cardIds.add(item.getCardId());
        }

        Map<String, Card> cardsById = new HashMap<>();

        if (!cardIds.isEmpty()) {
            for (Card card : cardRepository.findAllById(cardIds)) {
                cardsById.put(card.getId(), card);
            }
        }

        return items.map(item -> {
            Card card = cardsById.get(item.getCardId());

            if (card == null) {
                throw new IllegalStateException(
                        "Um item da coleção referencia uma carta inexistente.");
            }

            return toResponse(item, card);
        });
    }

    private CollectionItemResponse toResponse(
            CollectionItem item,
            Card card) {

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

        return new CollectionItemResponse(
                item.getId(),
                item.getQuantity(),
                item.getCondition(),
                item.getLanguage(),
                cardResponse
        );
    }

    public CollectionSummaryResponse summarizeOwnCollection(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário precisa ser informado.");
        }

        return collectionItemRepository.summarizeByUserId(userId)
                .orElseGet(() -> new CollectionSummaryResponse(0L, 0L, 0L));
    }

    public Page<CollectionItemResponse> findOwnCollection(
            String userId,
            int page,
            int size) {

        return findOwnCollection(
                userId,
                page,
                size,
                new CollectionFilters(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                )
        );
    }

    public CollectionFilterOptionsResponse findOwnFilterOptions(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário precisa ser informado.");
        }

        return collectionSearchRepository.findFilterOptions(userId);
    }

}