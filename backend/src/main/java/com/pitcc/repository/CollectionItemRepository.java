package com.pitcc.repository;

import com.pitcc.model.CollectionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.pitcc.dto.CollectionSummaryResponse;
import org.springframework.data.mongodb.repository.Aggregation;

import java.util.Optional;

public interface CollectionItemRepository extends MongoRepository<CollectionItem, String> {

    Page<CollectionItem> findByUserId(String userId, Pageable pageable);

    Optional<CollectionItem> findByIdAndUserId(
            String id,
            String userId
    );

    @Aggregation(pipeline = {
            """
            {
              "$match": {
                "userId": ?0
              }
            }
            """,
            """
            {
              "$set": {
                "cardLookupIds": [
                  "$cardId",
                  {
                    "$convert": {
                      "input": "$cardId",
                      "to": "objectId",
                      "onError": null,
                      "onNull": null
                    }
                  }
                ]
              }
            }
            """,
            """
            {
              "$lookup": {
                "from": "cards",
                "localField": "cardLookupIds",
                "foreignField": "_id",
                "as": "catalogCard"
              }
            }
            """,
            """
            {
              "$group": {
                "_id": null,
                "totalItems": { "$sum": 1 },
                "totalCopies": { "$sum": "$quantity" },
                "games": {
                  "$addToSet": {
                    "$ifNull": [
                      { "$arrayElemAt": ["$catalogCard.game", 0] },
                      null
                    ]
                  }
                }
              }
            }
            """,
            """
            {
              "$project": {
                "_id": 0,
                "totalItems": 1,
                "totalCopies": 1,
                "totalGames": {
                  "$size": {
                    "$setDifference": ["$games", [null]]
                  }
                }
              }
            }
            """
    })
    Optional<CollectionSummaryResponse> summarizeByUserId(String userId);


}
