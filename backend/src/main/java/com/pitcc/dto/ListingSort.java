package com.pitcc.dto;

import org.bson.Document;

import java.util.List;

public enum ListingSort {
    RECENT, OLDEST, NAME_ASC, NAME_DESC;

    public boolean byName() {
        return this == NAME_ASC || this == NAME_DESC;
    }

    public void addToPipeline(List<Document> pipeline, String dateField) {
        int direction = this == OLDEST || this == NAME_ASC ? 1 : -1;
        Document order = new Document();

        if (byName()) {
            Document name = new Document("$arrayElemAt", List.of("$catalogCard.name", 0));
            Document nameOrEmpty = new Document("$ifNull", List.of(name, ""));
            Document normalizedName = new Document("$toLower", nameOrEmpty);
            pipeline.add(new Document("$set", new Document("listingSortName", normalizedName)));
            order.append("listingSortName", direction);
        } else if (dateField != null) {
            order.append(dateField, direction);
        }

        order.append("_id", direction);
        pipeline.add(new Document("$sort", order));
    }
}
