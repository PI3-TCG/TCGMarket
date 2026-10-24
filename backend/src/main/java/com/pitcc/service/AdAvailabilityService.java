
package com.pitcc.service;

import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdAvailabilityService {

    private final CollectionItemRepository collectionItemRepository;

    public AdAvailabilityService(
            CollectionItemRepository collectionItemRepository
    ) {
        this.collectionItemRepository = collectionItemRepository;
    }

    public CollectionItemAvailabilityResponse availabilityOf(
            CollectionItem item
    ) {
        return availabilityOf(List.of(item)).get(item.getId());
    }

    public Map<String, CollectionItemAvailabilityResponse> availabilityOf(
            Collection<CollectionItem> items
    ) {
        if (items.isEmpty()) {
            return Map.of();
        }

        List<String> itemIds = items.stream()
                .map(CollectionItem::getId)
                .toList();

        Map<String, CollectionItem> currentItems = new HashMap<>();

        for (CollectionItem current :
                collectionItemRepository.findAllById(itemIds)) {

            currentItems.put(current.getId(), current);
        }

        Map<String, CollectionItemAvailabilityResponse> result =
                new HashMap<>();

        for (CollectionItem original : items) {

            CollectionItem current = currentItems.get(original.getId());

            if (current == null) {
                throw new IllegalStateException(
                        "O item da coleção não existe mais."
                );
            }

            Integer committedQuantity = current.getCommittedQuantity();

            if (committedQuantity == null) {
                throw new IllegalStateException(
                        "O item não possui controle de reservas inicializado."
                );
            }

            int total = current.getQuantity();
            int committed = committedQuantity;

            if (committed < 0 || committed > total) {
                throw new IllegalStateException(
                        "Quantidade comprometida inconsistente."
                );
            }

            result.put(
                    current.getId(),
                    new CollectionItemAvailabilityResponse(
                            total,
                            committed,
                            total - committed
                    )
            );
        }

        return result;
    }
}
