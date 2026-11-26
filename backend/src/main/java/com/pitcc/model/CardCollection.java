package com.pitcc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Coleção nomeada de um usuário. As cartas ficam em {@link CollectionItem}.
 */
@Document(collection = "collections")
public class CardCollection {

    public static final String DEFAULT_NAME = "Minha coleção";
    public static final int MAX_NAME_LENGTH = 40;

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;
    private boolean visible;
    private String coverItemId;
    private Instant createdAt;
    private Instant updatedAt;

    protected CardCollection() {
    }

    public CardCollection(String userId, String name, Instant now) {
        this(userId, name, false, now);
    }

    public CardCollection(String userId, String name, boolean visible, Instant now) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("O usuário precisa ser informado.");
        }
        this.userId = userId;
        this.name = name;
        this.visible = visible;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void rename(String name, Instant now) {
        this.name = name;
        this.updatedAt = now;
    }

    public void setVisible(boolean visible, Instant now) {
        this.visible = visible;
        this.updatedAt = now;
    }

    public void setCoverItemId(String coverItemId, Instant now) {
        this.coverItemId = coverItemId == null || coverItemId.isBlank() ? null : coverItemId;
        this.updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public boolean isVisible() {
        return visible;
    }

    public String getCoverItemId() {
        return coverItemId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
