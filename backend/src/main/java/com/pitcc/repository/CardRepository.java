
package com.pitcc.repository;

import com.pitcc.model.Card;
import com.pitcc.model.CardSource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;
import com.pitcc.model.CardGame;

public interface CardRepository extends MongoRepository<Card, String> {

    List<Card> findTop50ByGameAndNameContainingIgnoreCaseOrderByNameAscIdAsc(CardGame game, String name);
    long countBySourceAndExternalId(CardSource source, String externalId);

    Optional<Card> findBySourceAndExternalId(
            CardSource source,
            String externalId
    );

    boolean existsBySourceAndExternalId(
            CardSource source,
            String externalId
    );
}
