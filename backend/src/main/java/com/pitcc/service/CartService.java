package com.pitcc.service;

import com.pitcc.dto.CartItemResponse;
import com.pitcc.dto.CartItemResponse.CartItemAvailability;
import com.pitcc.dto.CartResponse;
import com.pitcc.dto.UpdateCartItemRequest;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.AdUnavailableForPurchaseException;
import com.pitcc.exception.CartConflictException;
import com.pitcc.exception.CartItemNotFoundException;
import com.pitcc.model.Ad;
import com.pitcc.model.Card;
import com.pitcc.model.Cart;
import com.pitcc.model.CartItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Carrinho do usuário autenticado. Não reserva exemplares: a disponibilidade
 * é conferida a cada operação e mostrada na leitura, e o checkout revalida.
 */
@Service
public class CartService {

    // Gravações concorrentes no mesmo carrinho (duas abas) são refeitas sobre a versão atual.
    private static final int MAX_ATTEMPTS = 3;

    private final CartRepository cartRepository;
    private final AdRepository adRepository;
    private final CardRepository cardRepository;

    public CartService(
            CartRepository cartRepository,
            AdRepository adRepository,
            CardRepository cardRepository
    ) {
        this.cartRepository = cartRepository;
        this.adRepository = adRepository;
        this.cardRepository = cardRepository;
    }

    public CartResponse getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElseGet(CartService::emptyCart);
    }

    public CartResponse addItem(String userId, String adId, int quantity) {
        Ad ad = adRepository.findById(adId).orElseThrow(AdNotFoundException::new);

        if (userId.equals(ad.getSellerId())) {
            throw new IllegalArgumentException("Não é possível comprar o próprio anúncio.");
        }

        int available = ad.availableForPurchase();

        if (available <= 0) {
            throw new AdUnavailableForPurchaseException(0);
        }

        Cart saved = update(userId, true, cart -> {
            int inCart = cart.find(adId).map(CartItem::getQuantity).orElse(0);

            if (inCart + quantity > available) {
                throw new AdUnavailableForPurchaseException(available, inCart);
            }

            cart.addItem(adId, ad.getSellerId(), quantity, ad.getUnitPrice(), available, Instant.now());
        });

        return toResponse(saved);
    }

    public CartResponse updateItem(String userId, String adId, UpdateCartItemRequest request) {
        Ad ad = adRepository.findById(adId).orElse(null);
        int available = ad == null ? 0 : ad.availableForPurchase();

        Cart saved = update(userId, false, cart -> {
            if (cart.find(adId).isEmpty()) {
                throw new CartItemNotFoundException();
            }

            Instant now = Instant.now();

            if (request.quantity() != null) {
                if (request.quantity() > available) {
                    throw new AdUnavailableForPurchaseException(available);
                }

                cart.changeQuantity(adId, request.quantity(), available, now);
            }

            if (Boolean.TRUE.equals(request.acceptCurrentPrice())) {
                if (available <= 0) {
                    throw new AdUnavailableForPurchaseException(0);
                }

                cart.acceptPrice(adId, ad.getUnitPrice(), now);
            }

            if (request.selected() != null) {
                if (request.selected() && available <= 0) {
                    throw new AdUnavailableForPurchaseException(0);
                }

                cart.select(adId, request.selected(), now);
            }
        });

        return toResponse(saved);
    }

    /** Idempotente: remover um anúncio que já não está no carrinho não é erro. */
    public CartResponse removeItem(String userId, String adId) {
        if (cartRepository.findByUserId(userId).isEmpty()) {
            return emptyCart();
        }

        return toResponse(update(userId, false, cart -> cart.removeItem(adId, Instant.now())));
    }

    /** "Selecionar todos" só seleciona anúncios que ainda podem ser comprados. */
    public CartResponse updateSelection(String userId, boolean selected) {
        Cart current = cartRepository.findByUserId(userId).orElse(null);

        if (current == null) {
            return emptyCart();
        }

        Map<String, Ad> ads = adsOf(current);

        Cart saved = update(userId, false, cart -> {
            Instant now = Instant.now();

            for (CartItem item : cart.getItems()) {
                Ad ad = ads.get(item.getAdId());
                boolean available = ad != null && ad.availableForPurchase() > 0;

                cart.select(item.getAdId(), selected && available, now);
            }
        });

        return toResponse(saved);
    }

    private Cart update(String userId, boolean createIfMissing, Consumer<Cart> change) {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            Cart cart = cartRepository.findByUserId(userId).orElse(null);

            if (cart == null) {
                if (!createIfMissing) {
                    throw new CartItemNotFoundException();
                }

                cart = new Cart(userId, Instant.now());
            }

            change.accept(cart);

            try {
                return cartRepository.save(cart);
            } catch (OptimisticLockingFailureException | DuplicateKeyException conflict) {
                // Outra requisição gravou primeiro; recarrega e aplica de novo.
            }
        }

        throw new CartConflictException();
    }

    private Map<String, Ad> adsOf(Cart cart) {
        List<String> adIds = cart.getItems().stream().map(CartItem::getAdId).toList();
        Map<String, Ad> ads = new HashMap<>();

        for (Ad ad : adRepository.findAllById(adIds)) {
            ads.put(ad.getId(), ad);
        }

        return ads;
    }

    private CartResponse toResponse(Cart cart) {
        if (cart.getItems().isEmpty()) {
            return emptyCart();
        }

        Map<String, Ad> ads = adsOf(cart);

        List<String> cardIds = ads.values().stream().map(Ad::getCardId).distinct().toList();
        Map<String, Card> cards = new HashMap<>();

        for (Card card : cardRepository.findAllById(cardIds)) {
            cards.put(card.getId(), card);
        }

        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> toItemResponse(item, ads.get(item.getAdId()), cards))
                .toList();

        return new CartResponse(items, cart.distinctItemCount());
    }

    private static CartItemResponse toItemResponse(
            CartItem item,
            Ad ad,
            Map<String, Card> cards
    ) {
        Card card = ad == null ? null : cards.get(ad.getCardId());
        int available = ad == null ? 0 : ad.availableForPurchase();

        CartItemAvailability availability;

        if (available <= 0) {
            availability = CartItemAvailability.UNAVAILABLE;
        } else if (item.getQuantity() > available) {
            availability = CartItemAvailability.REDUCED;
        } else {
            availability = CartItemAvailability.AVAILABLE;
        }

        boolean purchasable = available > 0;

        return new CartItemResponse(
                item.getAdId(),
                card == null ? null : card.getId(),
                card == null ? null : card.getName(),
                card == null ? null : card.getGame(),
                card == null ? null : card.getEdition(),
                card == null ? null : card.getImageUrl(),
                ad == null ? null : ad.getCondition(),
                ad == null ? null : ad.getLanguage(),
                item.getQuantity(),
                item.isSelected() && purchasable,
                item.getAcceptedUnitPrice(),
                purchasable ? ad.getUnitPrice() : null,
                available,
                availability,
                purchasable && ad.getUnitPrice().compareTo(item.getAcceptedUnitPrice()) != 0
        );
    }

    private static CartResponse emptyCart() {
        return new CartResponse(List.of(), 0);
    }
}
