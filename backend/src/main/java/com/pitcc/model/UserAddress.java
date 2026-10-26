package com.pitcc.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Endereço de entrega cadastrado pelo usuário. Guarda um {@link DeliveryAddress}
 * já validado, que o checkout copia para o pedido.
 */
@Document(collection = "addresses")
@CompoundIndex(
        name = "uk_addresses_primary",
        def = "{'userId': 1}",
        unique = true,
        partialFilter = "{'primary': true}"
)
public class UserAddress {

    public static final int LABEL_MAX_LENGTH = 30;

    @Id
    private String id;

    @Indexed(name = "ix_addresses_user")
    private String userId;

    private String label;
    private DeliveryAddress address;
    private boolean primary;

    private Instant createdAt;
    private Instant updatedAt;

    @Version
    private Long version;

    protected UserAddress() {
    }

    public UserAddress(String userId, String label, DeliveryAddress address, boolean primary, Instant now) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("O usuário do endereço é obrigatório.");
        }

        this.userId = userId;
        this.createdAt = now;
        update(label, address, primary, now);
    }

    public void update(String label, DeliveryAddress address, boolean primary, Instant now) {
        if (address == null) {
            throw new IllegalArgumentException("O endereço é obrigatório.");
        }

        this.label = normalizeLabel(label);
        this.address = address;
        this.primary = primary;
        this.updatedAt = now;
    }

    private static String normalizeLabel(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }

        String stripped = label.strip();

        if (stripped.length() > LABEL_MAX_LENGTH) {
            throw new DeliveryAddress.InvalidFieldException(
                    "label",
                    "Use até " + LABEL_MAX_LENGTH + " caracteres na identificação."
            );
        }

        return stripped;
    }

    public boolean belongsTo(String userId) {
        return this.userId.equals(userId);
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getLabel() {
        return label;
    }

    public DeliveryAddress getAddress() {
        return address;
    }

    public boolean isPrimary() {
        return primary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
