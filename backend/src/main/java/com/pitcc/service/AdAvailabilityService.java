package com.pitcc.service;

import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdCommitmentRepository;

import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Regra central de disponibilidade:
 * disponível = quantidade na coleção - quantidade comprometida em anúncios ativos.
 */
@Service
public class AdAvailabilityService {

    private final AdCommitmentRepository adCommitmentRepository;

    public AdAvailabilityService(AdCommitmentRepository adCommitmentRepository) {
        this.adCommitmentRepository = adCommitmentRepository;
    }

    public CollectionItemAvailabilityResponse availabilityOf(CollectionItem item) {
        return availabilityOf(List.of(item)).get(item.getId());
    }

    public Map<String, CollectionItemAvailabilityResponse> availabilityOf(
            Collection<CollectionItem> items
    ) {
        Map<String, Integer> committedByItem = adCommitmentRepository
                .sumActiveRemainingByCollectionItem(
                        items.stream().map(CollectionItem::getId).toList()
                );

        Map<String, CollectionItemAvailabilityResponse> result = new HashMap<>();

        for (CollectionItem item : items) {
            int total = item.getQuantity();
            int committed = committedByItem.getOrDefault(item.getId(), 0);

            result.put(item.getId(), new CollectionItemAvailabilityResponse(
                    total,
                    committed,
                    Math.max(0, total - committed)
            ));
        }

        return result;
    }
}
