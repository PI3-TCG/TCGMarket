package com.pitcc.service;

import com.pitcc.dto.CheckoutValidationResponse;
import com.pitcc.dto.CheckoutValidationResponse.IssueCode;
import com.pitcc.dto.CheckoutValidationResponse.ItemIssue;
import com.pitcc.dto.CheckoutValidationResponse.SellerGroup;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.Cart;
import com.pitcc.model.CartItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CartRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Revalida os itens selecionados do carrinho imediatamente antes do pedido.
 * O carrinho não reserva exemplares, então anúncio, quantidade e preço podem
 * ter mudado desde que o item foi adicionado.
 */
@Service
public class CheckoutValidationService {

    private final CartRepository cartRepository;
    private final AdRepository adRepository;
    private final CardRepository cardRepository;

    public CheckoutValidationService(
            CartRepository cartRepository,
            AdRepository adRepository,
            CardRepository cardRepository
    ) {
        this.cartRepository = cartRepository;
        this.adRepository = adRepository;
        this.cardRepository = cardRepository;
    }

    public CheckoutValidationResponse validate(String buyerId) {
        List<CartItem> selected = cartRepository.findByUserId(buyerId)
                .map(Cart::selectedItems)
                .orElse(List.of());

        if (selected.isEmpty()) {
            return new CheckoutValidationResponse(false, true, List.of(), List.of(), BigDecimal.ZERO);
        }

        Map<String, Ad> ads = new HashMap<>();
        for (Ad ad : adRepository.findAllById(selected.stream().map(CartItem::getAdId).toList())) {
            ads.put(ad.getId(), ad);
        }

        Set<String> cardIds = new HashSet<>();
        for (Card card : cardRepository.findAllById(ads.values().stream().map(Ad::getCardId).distinct().toList())) {
            cardIds.add(card.getId());
        }

        List<ItemIssue> issues = new ArrayList<>();
        Map<String, List<CartItem>> bySeller = new LinkedHashMap<>();

        for (CartItem item : selected) {
            Ad ad = ads.get(item.getAdId());
            List<IssueCode> codes = issuesOf(buyerId, item, ad, cardIds);

            if (codes.isEmpty()) {
                bySeller.computeIfAbsent(ad.getSellerId(), seller -> new ArrayList<>()).add(item);
                continue;
            }

            boolean purchasable = ad != null && ad.availableForPurchase() > 0;
            issues.add(new ItemIssue(
                    item.getAdId(),
                    codes,
                    item.getQuantity(),
                    ad == null ? 0 : ad.availableForPurchase(),
                    item.getAcceptedUnitPrice(),
                    purchasable ? ad.getUnitPrice() : null
            ));
        }

        List<SellerGroup> sellers = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<String, List<CartItem>> entry : bySeller.entrySet()) {
            BigDecimal subtotal = entry.getValue().stream()
                    .map(CartItem::subtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            sellers.add(new SellerGroup(
                    entry.getKey(),
                    entry.getValue().stream().map(CartItem::getAdId).toList(),
                    subtotal
            ));
            total = total.add(subtotal);
        }

        return new CheckoutValidationResponse(issues.isEmpty(), false, issues, sellers, total);
    }

    private static List<IssueCode> issuesOf(String buyerId, CartItem item, Ad ad, Set<String> cardIds) {
        if (ad == null) {
            return List.of(IssueCode.AD_NOT_FOUND);
        }

        List<IssueCode> codes = new ArrayList<>();

        if (ad.getStatus() == AdStatus.CANCELLED) {
            codes.add(IssueCode.AD_CANCELLED);
        } else if (ad.getStatus() != AdStatus.ACTIVE
                || ad.getRemainingQuantity() == null
                || ad.getRemainingQuantity() <= 0) {
            codes.add(IssueCode.AD_SOLD_OUT);
        } else if (!ad.isSaleEnabled()) {
            codes.add(IssueCode.SALE_DISABLED);
        } else {
            if (item.getQuantity() > ad.availableForPurchase()) {
                codes.add(IssueCode.QUANTITY_UNAVAILABLE);
            }
            if (ad.getUnitPrice() == null || ad.getUnitPrice().compareTo(item.getAcceptedUnitPrice()) != 0) {
                codes.add(IssueCode.PRICE_CHANGED);
            }
        }

        if (buyerId.equals(ad.getSellerId())) {
            codes.add(IssueCode.OWN_AD);
        }
        if (!ad.getSellerId().equals(item.getSellerId())) {
            codes.add(IssueCode.SELLER_CHANGED);
        }
        if (!cardIds.contains(ad.getCardId())) {
            codes.add(IssueCode.CARD_NOT_FOUND);
        }

        return codes;
    }
}
