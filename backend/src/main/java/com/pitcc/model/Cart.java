package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Carrinho do comprador. Existe um por usuário e aceita anúncios de
 * vendedores diferentes; o checkout separa os itens por vendedor.
 */
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    @Indexed(name = "uk_carts_user", unique = true)
    private String userId;

    private List<CartItem> items = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    // Controle otimista: duas abas alterando o carrinho não sobrescrevem uma à outra.
    @Version
    private Long version;

    protected Cart() {
    }

    public Cart(String userId, Instant now) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("O usuário do carrinho é obrigatório.");
        }

        this.userId = userId;
        this.items = new ArrayList<>();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Adiciona exemplares de um anúncio. Repetir o anúncio acumula na mesma
     * linha e atualiza o preço aceito para o preço atual.
     *
     * @param availableQuantity exemplares do anúncio disponíveis para compra agora
     */
    public void addItem(
            String adId,
            String sellerId,
            int quantity,
            BigDecimal unitPrice,
            int availableQuantity,
            Instant now
    ) {
        if (adId == null || adId.isBlank()) {
            throw new IllegalArgumentException("O anúncio precisa ser informado.");
        }

        if (sellerId == null || sellerId.isBlank()) {
            throw new IllegalArgumentException("O vendedor precisa ser informado.");
        }

        if (userId.equals(sellerId)) {
            throw new IllegalArgumentException("Não é possível comprar o próprio anúncio.");
        }

        requirePositive(quantity);
        requirePrice(unitPrice);

        Optional<CartItem> existing = find(adId);
        int total = quantity + existing.map(CartItem::getQuantity).orElse(0);

        requireAvailable(total, availableQuantity);

        if (existing.isPresent()) {
            existing.get().changeQuantity(total, now);
            existing.get().acceptPrice(unitPrice, now);
        } else {
            items.add(new CartItem(adId, sellerId, total, unitPrice, now));
        }

        this.updatedAt = now;
    }

    public void changeQuantity(
            String adId,
            int quantity,
            int availableQuantity,
            Instant now
    ) {
        requirePositive(quantity);
        requireAvailable(quantity, availableQuantity);

        require(adId).changeQuantity(quantity, now);
        this.updatedAt = now;
    }

    public void acceptPrice(String adId, BigDecimal unitPrice, Instant now) {
        requirePrice(unitPrice);

        require(adId).acceptPrice(unitPrice, now);
        this.updatedAt = now;
    }

    public void select(String adId, boolean selected, Instant now) {
        require(adId).select(selected, now);
        this.updatedAt = now;
    }

    /** @return {@code false} se o anúncio já não estava no carrinho */
    public boolean removeItem(String adId, Instant now) {
        boolean removed = items.removeIf(item -> item.getAdId().equals(adId));

        if (removed) {
            this.updatedAt = now;
        }

        return removed;
    }

    /** Remove só os anúncios cuja compra foi aprovada; os demais continuam. */
    public void removePurchased(Collection<String> adIds, Instant now) {
        if (items.removeIf(item -> adIds.contains(item.getAdId()))) {
            this.updatedAt = now;
        }
    }

    /** Valor do contador da navbar: anúncios distintos, não exemplares. */
    public int distinctItemCount() {
        return items.size();
    }

    public List<CartItem> selectedItems() {
        return items.stream().filter(CartItem::isSelected).toList();
    }

    public Optional<CartItem> find(String adId) {
        return items.stream()
                .filter(item -> item.getAdId().equals(adId))
                .findFirst();
    }

    private CartItem require(String adId) {
        return find(adId).orElseThrow(() ->
                new IllegalArgumentException("O anúncio não está no carrinho.")
        );
    }

    private static void requirePositive(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade precisa ser maior que zero.");
        }
    }

    private static void requirePrice(BigDecimal unitPrice) {
        if (unitPrice == null || unitPrice.signum() <= 0) {
            throw new IllegalArgumentException("O anúncio precisa ter preço de venda.");
        }
    }

    private static void requireAvailable(int quantity, int availableQuantity) {
        if (availableQuantity <= 0) {
            throw new IllegalArgumentException("O anúncio não tem exemplares disponíveis.");
        }

        if (quantity > availableQuantity) {
            throw new IllegalArgumentException(
                    "Informe uma quantidade entre 1 e " + availableQuantity + "."
            );
        }
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public List<CartItem> getItems() {
        return List.copyOf(items);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
