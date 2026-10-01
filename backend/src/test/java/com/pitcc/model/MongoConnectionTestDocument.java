package com.pitcc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "mongoConnectionTests")
public class MongoConnectionTestDocument {

    @Id
    private String id;

    private String message;

    // construtores
    public MongoConnectionTestDocument() {
    }

    public MongoConnectionTestDocument(String id, String message) {
        this.id = id;
        this.message = message;
    }

    // getters/setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}