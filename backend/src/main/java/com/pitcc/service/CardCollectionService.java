package com.pitcc.service;

import com.pitcc.dto.CardCollectionResponse;
import com.pitcc.exception.CollectionDeleteBlockedException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.CollectionNotFoundException;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCollection;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardCollectionRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CardCollectionService {

    private final CardCollectionRepository collectionRepository;
    private final CollectionItemRepository itemRepository;
    private final CardRepository cardRepository;
    private final AdRepository adRepository;

    public CardCollectionService(
            CardCollectionRepository collectionRepository,
            CollectionItemRepository itemRepository,
            CardRepository cardRepository,
            AdRepository adRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.itemRepository = itemRepository;
        this.cardRepository = cardRepository;
        this.adRepository = adRepository;
    }

    public List<CardCollectionResponse> list(String userId) {
        requireUser(userId);
        return collectionRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CardCollectionResponse> listVisible(String userId) {
        requireUser(userId);
        return collectionRepository.findByUserIdAndVisibleTrueOrderByCreatedAtAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CardCollectionResponse create(String userId, String name) {
        requireUser(userId);
        String normalized = normalize(name);
        rejectDuplicateName(userId, normalized);
        CardCollection saved = collectionRepository.save(
                new CardCollection(userId, normalized, Instant.now())
        );
        return toResponse(saved);
    }

    public CardCollectionResponse rename(String userId, String collectionId, String name) {
        CardCollection collection = requireOwned(userId, collectionId);
        String normalized = normalize(name);
        if (!collection.getName().equalsIgnoreCase(normalized)) {
            rejectDuplicateName(userId, normalized);
            collection.rename(normalized, Instant.now());
            collection = collectionRepository.save(collection);
        }
        return toResponse(collection);
    }

    public CardCollectionResponse setVisible(String userId, String collectionId, boolean visible) {
        CardCollection collection = requireOwned(userId, collectionId);
        if (collection.isVisible() != visible) {
            collection.setVisible(visible, Instant.now());
            collection = collectionRepository.save(collection);
        }
        return toResponse(collection);
    }

    public CardCollectionResponse setCover(String userId, String collectionId, String itemId) {
        CardCollection collection = requireOwned(userId, collectionId);
        if (itemId == null || itemId.isBlank()) {
            collection.setCoverItemId(null, Instant.now());
        } else {
            CollectionItem item = itemRepository.findByIdAndUserId(itemId, userId)
                    .filter(candidate -> collection.getId().equals(candidate.getCollectionId()))
                    .orElseThrow(CollectionItemNotFoundException::new);
            collection.setCoverItemId(item.getId(), Instant.now());
        }
        return toResponse(collectionRepository.save(collection));
    }

    public void delete(String userId, String collectionId) {
        CardCollection collection = requireOwned(userId, collectionId);
        List<CollectionItem> items = itemRepository.findByCollectionId(collection.getId());
        List<String> itemIds = items.stream().map(CollectionItem::getId).toList();
        if (!itemIds.isEmpty()
                && adRepository.existsByCollectionItemIdInAndStatus(itemIds, AdStatus.ACTIVE)) {
            throw new CollectionDeleteBlockedException();
        }
        if (!itemIds.isEmpty()) {
            itemRepository.deleteByCollectionId(collection.getId());
        }
        collectionRepository.delete(collection);
    }

    public CardCollection requireOwned(String userId, String collectionId) {
        requireUser(userId);
        if (collectionId == null || collectionId.isBlank()) {
            throw new CollectionNotFoundException();
        }
        return collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(CollectionNotFoundException::new);
    }

    private void rejectDuplicateName(String userId, String name) {
        if (collectionRepository.existsByUserIdAndNameIgnoreCase(userId, name)) {
            throw new IllegalArgumentException("Você já tem uma coleção com esse nome.");
        }
    }

    static String normalize(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Informe o nome da coleção.");
        }
        String normalized = name.strip().replaceAll("\\s+", " ");
        if (normalized.length() > CardCollection.MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "O nome da coleção deve ter no máximo "
                            + CardCollection.MAX_NAME_LENGTH + " caracteres."
            );
        }
        return normalized;
    }

    private static void requireUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("O usuário precisa ser informado.");
        }
    }

    private CardCollectionResponse toResponse(CardCollection collection) {
        return new CardCollectionResponse(
                collection.getId(),
                collection.getName(),
                collection.isVisible(),
                collection.getCoverItemId(),
                coverImage(collection),
                cardCount(collection)
        );
    }

    private int cardCount(CardCollection collection) {
        return itemRepository.findByCollectionId(collection.getId()).stream()
                .mapToInt(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                .sum();
    }

    private String coverImage(CardCollection collection) {
        String itemId = collection.getCoverItemId();
        if (itemId == null || itemId.isBlank()) {
            return null;
        }
        return itemRepository.findByIdAndUserId(itemId, collection.getUserId())
                .filter(item -> collection.getId().equals(item.getCollectionId()))
                .flatMap(item -> cardRepository.findById(item.getCardId()))
                .map(Card::getImageUrl)
                .filter(url -> url != null && !url.isBlank())
                .orElse(null);
    }
}
