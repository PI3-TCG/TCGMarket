package com.pitcc.service;

import com.pitcc.dto.MarketplaceAdResponse;
import com.pitcc.dto.MarketplacePageResponse;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.User;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.UserRepository;
import com.pitcc.dto.MarketplaceFilters;
import com.pitcc.repository.MarketplaceSearchRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class MarketplaceService {

    private static final int PAGE_SIZE = 20;

    private final AdRepository adRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final MarketplaceSearchRepository marketplaceSearchRepository;

    public MarketplaceService(
            AdRepository adRepository,
            CollectionItemRepository collectionItemRepository,
            CardRepository cardRepository,
            UserRepository userRepository,
            MarketplaceSearchRepository marketplaceSearchRepository
    ) {
        this.adRepository = adRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.marketplaceSearchRepository = marketplaceSearchRepository;
    }

    public MarketplacePageResponse listAvailableAds(
            int page,
            String sort,
            MarketplaceFilters filters,
            String viewerId
    ) {
        // A API recebe páginas começando em 1.
        if (page < 1) {
            throw new IllegalArgumentException(
                    "A página deve ser maior ou igual a 1."
            );
        }

        // Mais recentes primeiro; o ID desempata datas iguais.
        Sort ordering = switch (sort) {
            case "recent" -> Sort.by(
                    Sort.Order.desc("createdAt"),
                    Sort.Order.desc("id")
            );

            case "priceDesc" -> Sort.by(
                    Sort.Order.desc("unitPrice"),
                    Sort.Order.desc("createdAt"),
                    Sort.Order.desc("id")
            );

            default -> throw new IllegalArgumentException(
                    "Ordenação inválida. Use recent ou priceDesc."
            );
        };

        PageRequest pageable = PageRequest.of(
                page - 1,
                PAGE_SIZE,
                ordering
        );

        Page<Ad> adsPage =
                marketplaceSearchRepository.findAvailableAds(
                        filters,
                        pageable
                );

        List<Ad> ads = adsPage.getContent();

        // Evita buscas adicionais quando a página não contém anúncios.
        if (ads.isEmpty()) {
            return new MarketplacePageResponse(
                    List.of(),
                    page,
                    PAGE_SIZE,
                    adsPage.getTotalElements(),
                    adsPage.getTotalPages()
            );
        }

        // Busca os itens de coleção relacionados aos anúncios desta página.
        List<String> itemIds = ads.stream()
                .map(Ad::getCollectionItemId)
                .distinct()
                .toList();

        Map<String, CollectionItem> itemsById = new HashMap<>();

        for (CollectionItem item :
                collectionItemRepository.findAllById(itemIds)) {
            itemsById.put(item.getId(), item);
        }

        // Os itens da coleção indicam quais cartas precisamos consultar.
        List<String> cardIds = itemsById.values().stream()
                .map(CollectionItem::getCardId)
                .distinct()
                .toList();

        Map<String, Card> cardsById = new HashMap<>();

        for (Card card : cardRepository.findAllById(cardIds)) {
            cardsById.put(card.getId(), card);
        }

        // Busca os vendedores relacionados aos anúncios desta página.
        List<String> sellerIds = ads.stream()
                .map(Ad::getSellerId)
                .distinct()
                .toList();

        Map<String, User> sellersById = new HashMap<>();

        for (User seller : userRepository.findAllById(sellerIds)) {
            sellersById.put(seller.getId(), seller);
        }

        // Monta os DTOs usando os dados já carregados.
        List<MarketplaceAdResponse> content = ads.stream()
                .map(ad -> toResponse(
                        ad,
                        itemsById,
                        cardsById,
                        sellersById,
                        viewerId
                ))
                .toList();

        return new MarketplacePageResponse(
                content,
                page,
                PAGE_SIZE,
                adsPage.getTotalElements(),
                adsPage.getTotalPages()
        );
    }

    private MarketplaceAdResponse toResponse(
            Ad ad,
            Map<String, CollectionItem> itemsById,
            Map<String, Card> cardsById,
            Map<String, User> sellersById,
            String viewerId
    ) {
        CollectionItem item = itemsById.get(ad.getCollectionItemId());
        User seller = sellersById.get(ad.getSellerId());

        if (item == null || seller == null) {
            throw new IllegalStateException(
                    "Anúncio com referência de coleção ou vendedor inexistente."
            );
        }

        if (!Objects.equals(item.getUserId(), seller.getId())) {
            throw new IllegalStateException(
                    "O item da coleção não pertence ao vendedor do anúncio."
            );
        }

        Card card = cardsById.get(item.getCardId());

        if (card == null) {
            throw new IllegalStateException(
                    "A carta vinculada ao anúncio não foi encontrada."
            );
        }

        return new MarketplaceAdResponse(
                ad.getId(),
                card.getId(),
                card.getName(),
                card.getGame(),
                card.getEdition(),
                card.getCardNumber(),
                card.getOfficialRarity(),
                card.getImageUrl(),
                item.getCondition(),
                item.getLanguage(),
                ad.getRemainingQuantity(),
                ad.isSaleEnabled(),
                ad.isTradeEnabled(),
                ad.isSaleEnabled() ? ad.getUnitPrice() : null,
                seller.getUsername(),
                ad.getDescription(),
                viewerId != null && viewerId.equals(ad.getSellerId())
        );
    }

    public MarketplaceAdResponse getAvailableAd(String id, String viewerId) {
        Ad ad = adRepository
                .findByIdAndStatusAndRemainingQuantityGreaterThan(
                        id,
                        AdStatus.ACTIVE,
                        0
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anúncio não encontrado ou indisponível."
                ));

        CollectionItem item = collectionItemRepository
                .findById(ad.getCollectionItemId())
                .orElseThrow(() -> new IllegalStateException(
                        "O item vinculado ao anúncio não foi encontrado."
                ));

        Card card = cardRepository
                .findById(item.getCardId())
                .orElseThrow(() -> new IllegalStateException(
                        "A carta vinculada ao anúncio não foi encontrada."
                ));

        User seller = userRepository
                .findById(ad.getSellerId())
                .orElseThrow(() -> new IllegalStateException(
                        "O vendedor vinculado ao anúncio não foi encontrado."
                ));

        return toResponse(
                ad,
                Map.of(item.getId(), item),
                Map.of(card.getId(), card),
                Map.of(seller.getId(), seller),
                viewerId
        );
    }
}