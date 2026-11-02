
package com.pitcc.service;

import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TradeAvailabilityServiceTest {

    private CollectionItemRepository collectionRepository;
    private AdRepository adRepository;
    private TradeAvailabilityService service;

    @BeforeEach
    void setUp() {
        collectionRepository = mock(CollectionItemRepository.class);
        adRepository = mock(AdRepository.class);

        service = new TradeAvailabilityService(
                collectionRepository,
                adRepository
        );
    }

    @Test
    void shouldRejectProposalThatIsNotPending() {
        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "ACCEPTED",
                List.of(),
                List.of()
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        verifyNoInteractions(collectionRepository, adRepository);
    }

    @Test
    void shouldRejectUnauthorizedUser() {
        var proposal = new TradeAvailabilityService.TradeContext(
                "unauthorized-user",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(),
                List.of()
        );

        assertThrows(
                AccessDeniedException.class,
                () -> service.validate(proposal)
        );

        verifyNoInteractions(collectionRepository, adRepository);
    }

    @Test
    void shouldRejectInsufficientAvailableQuantity() {

        // Anúncio que originou a proposta
        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.ACTIVE);

        when(ad.isTradeEnabled()).thenReturn(true);
        when(ad.getSellerId()).thenReturn("recipient-1");
        when(ad.getCollectionItemId()).thenReturn("item-target");
        when(ad.getCardId()).thenReturn("card-target");

        // Carta oferecida pelo proponente
        var item = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-offer", "proposer-1"
        )).thenReturn(java.util.Optional.of(item));

        when(item.getId()).thenReturn("item-offer");
        when(item.getCardId()).thenReturn("card-offer");

        when(item.getQuantity()).thenReturn(5);
        when(item.getCommittedQuantity()).thenReturn(4);

        var offered = new TradeAvailabilityService.TradeLine(
                "item-offer",
                "card-offer",
                null,
                null,
                null,
                2
        );

        var requested = new TradeAvailabilityService.TradeLine(
                "item-target",
                "card-target",
                null,
                null,
                "ad-1",
                1
        );

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(offered),
                List.of(requested)
        );

        var exception = assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "Quantidade livre insuficiente na coleção.",
                exception.getMessage()
        );
    }

    @Test
    void shouldRejectTradeWhenPurchaseHoldsReduceAvailability() {

        var condition = com.pitcc.model.CardCondition.values()[0];
        var language = com.pitcc.model.CardLanguage.values()[0];

        // Carta que o proponente oferece.
        var offeredItem = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-offer", "proposer-1"
        )).thenReturn(java.util.Optional.of(offeredItem));

        when(offeredItem.getId()).thenReturn("item-offer");
        when(offeredItem.getCardId()).thenReturn("card-offer");
        when(offeredItem.getCondition()).thenReturn(condition);
        when(offeredItem.getLanguage()).thenReturn(language);
        when(offeredItem.getQuantity()).thenReturn(3);
        when(offeredItem.getCommittedQuantity()).thenReturn(0);

        // Carta solicitada ao destinatário.
        var requestedItem = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-target", "recipient-1"
        )).thenReturn(java.util.Optional.of(requestedItem));

        when(requestedItem.getId()).thenReturn("item-target");
        when(requestedItem.getCardId()).thenReturn("card-target");
        when(requestedItem.getCondition()).thenReturn(condition);
        when(requestedItem.getLanguage()).thenReturn(language);
        when(requestedItem.getQuantity()).thenReturn(3);
        when(requestedItem.getCommittedQuantity()).thenReturn(3);

        var reservation = mock(com.pitcc.model.AdReservation.class);

        when(reservation.getAdId()).thenReturn("ad-1");
        when(reservation.getStatus())
                .thenReturn(com.pitcc.model.AdReservationStatus.ACTIVE);
        when(reservation.getQuantity()).thenReturn(3);

        when(requestedItem.getAdReservations())
                .thenReturn(List.of(reservation));

        // Anúncio com 3 unidades, sendo 2 reservadas para compra.
        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getId()).thenReturn("ad-1");
        when(ad.getStatus()).thenReturn(com.pitcc.model.AdStatus.ACTIVE);
        when(ad.isTradeEnabled()).thenReturn(true);
        when(ad.getSellerId()).thenReturn("recipient-1");
        when(ad.getCollectionItemId()).thenReturn("item-target");
        when(ad.getCardId()).thenReturn("card-target");
        when(ad.getCondition()).thenReturn(condition);
        when(ad.getLanguage()).thenReturn(language);
        when(ad.getRemainingQuantity()).thenReturn(3);

        var purchaseHold = new com.pitcc.model.AdPurchaseHold(
                "order-1",
                2,
                java.time.Instant.now()
        );

        when(ad.getPurchaseHolds()).thenReturn(List.of(purchaseHold));

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(new TradeAvailabilityService.TradeLine(
                        "item-offer", "card-offer",
                        condition, language, null, 1
                )),
                List.of(new TradeAvailabilityService.TradeLine(
                        "item-target", "card-target",
                        condition, language, "ad-1", 2
                ))
        );

        var exception = assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "Quantidade indisponível no anúncio.",
                exception.getMessage()
        );
    }

    @Test
    void shouldRejectCardNotOwnedByProposer() {

        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.ACTIVE);
        when(ad.isTradeEnabled()).thenReturn(true);
        when(ad.getSellerId()).thenReturn("recipient-1");
        when(ad.getCollectionItemId()).thenReturn("item-target");
        when(ad.getCardId()).thenReturn("card-target");

        // A carta não foi encontrada na coleção do proponente.
        when(collectionRepository.findByIdAndUserId(
                "item-offer", "proposer-1"
        )).thenReturn(java.util.Optional.empty());

        var offered = new TradeAvailabilityService.TradeLine(
                "item-offer", "card-offer",
                null, null, null, 1
        );

        var requested = new TradeAvailabilityService.TradeLine(
                "item-target", "card-target",
                null, null, "ad-1", 1
        );

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(offered),
                List.of(requested)
        );

        var exception = assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "A carta não pertence mais ao usuário.",
                exception.getMessage()
        );
    }

    @Test
    void shouldRejectCancelledAd() {

        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.CANCELLED);

        var offered = new TradeAvailabilityService.TradeLine(
                "item-offer", "card-offer",
                null, null, null, 1
        );

        var requested = new TradeAvailabilityService.TradeLine(
                "item-target", "card-target",
                null, null, "ad-1", 1
        );

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(offered),
                List.of(requested)
        );

        var exception = assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "O anúncio não está disponível para troca.",
                exception.getMessage()
        );

        verifyNoInteractions(collectionRepository);
    }

    @Test
    void shouldRejectAdWithTradeDisabled() {

        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.ACTIVE);

        when(ad.isTradeEnabled()).thenReturn(false);

        var offered = new TradeAvailabilityService.TradeLine(
                "item-offer", "card-offer",
                null, null, null, 1
        );

        var requested = new TradeAvailabilityService.TradeLine(
                "item-target", "card-target",
                null, null, "ad-1", 1
        );

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(offered),
                List.of(requested)
        );

        var exception = assertThrows(
                IllegalStateException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "O anúncio não está disponível para troca.",
                exception.getMessage()
        );
    }

    @Test
    void shouldValidateTradeWhenAllCardsAreAvailable() {

        var condition = com.pitcc.model.CardCondition.values()[0];
        var language = com.pitcc.model.CardLanguage.values()[0];

        // Carta oferecida pelo proponente
        var offeredItem = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-offer", "proposer-1"
        )).thenReturn(java.util.Optional.of(offeredItem));

        when(offeredItem.getId()).thenReturn("item-offer");
        when(offeredItem.getCardId()).thenReturn("card-offer");
        when(offeredItem.getCondition()).thenReturn(condition);
        when(offeredItem.getLanguage()).thenReturn(language);
        when(offeredItem.getQuantity()).thenReturn(3);
        when(offeredItem.getCommittedQuantity()).thenReturn(1);

        // Carta solicitada ao destinatário
        var requestedItem = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-target", "recipient-1"
        )).thenReturn(java.util.Optional.of(requestedItem));

        when(requestedItem.getId()).thenReturn("item-target");
        when(requestedItem.getCardId()).thenReturn("card-target");
        when(requestedItem.getCondition()).thenReturn(condition);
        when(requestedItem.getLanguage()).thenReturn(language);
        when(requestedItem.getQuantity()).thenReturn(2);
        when(requestedItem.getCommittedQuantity()).thenReturn(2);

        // Reserva existente para o anúncio
        var reservation = mock(com.pitcc.model.AdReservation.class);

        when(reservation.getAdId()).thenReturn("ad-1");
        when(reservation.getStatus())
                .thenReturn(com.pitcc.model.AdReservationStatus.ACTIVE);
        when(reservation.getQuantity()).thenReturn(2);

        when(requestedItem.getAdReservations())
                .thenReturn(List.of(reservation));

        // Anúncio ativo e disponível para troca
        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getId()).thenReturn("ad-1");
        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.ACTIVE);
        when(ad.isTradeEnabled()).thenReturn(true);
        when(ad.getSellerId()).thenReturn("recipient-1");
        when(ad.getCollectionItemId()).thenReturn("item-target");
        when(ad.getCardId()).thenReturn("card-target");
        when(ad.getCondition()).thenReturn(condition);
        when(ad.getLanguage()).thenReturn(language);
        when(ad.getRemainingQuantity()).thenReturn(2);
        when(ad.getPurchaseHolds()).thenReturn(List.of());

        // Proposta válida: 1 carta por 1 carta
        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(new TradeAvailabilityService.TradeLine(
                        "item-offer",
                        "card-offer",
                        condition,
                        language,
                        null,
                        1
                )),
                List.of(new TradeAvailabilityService.TradeLine(
                        "item-target",
                        "card-target",
                        condition,
                        language,
                        "ad-1",
                        1
                ))
        );

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(
                () -> service.validate(proposal)
        );
    }

    @Test
    void shouldRejectDuplicateLinesExceedingAvailableQuantity() {

        var condition = com.pitcc.model.CardCondition.values()[0];
        var language = com.pitcc.model.CardLanguage.values()[0];

        var ad = mock(com.pitcc.model.Ad.class);

        when(adRepository.findById("ad-1"))
                .thenReturn(java.util.Optional.of(ad));

        when(ad.getStatus())
                .thenReturn(com.pitcc.model.AdStatus.ACTIVE);
        when(ad.isTradeEnabled()).thenReturn(true);
        when(ad.getSellerId()).thenReturn("recipient-1");
        when(ad.getCollectionItemId()).thenReturn("item-target");
        when(ad.getCardId()).thenReturn("card-target");

        var item = mock(com.pitcc.model.CollectionItem.class);

        when(collectionRepository.findByIdAndUserId(
                "item-offer", "proposer-1"
        )).thenReturn(java.util.Optional.of(item));

        when(item.getId()).thenReturn("item-offer");
        when(item.getCardId()).thenReturn("card-offer");
        when(item.getCondition()).thenReturn(condition);
        when(item.getLanguage()).thenReturn(language);
        when(item.getQuantity()).thenReturn(3);
        when(item.getCommittedQuantity()).thenReturn(0);

        var line = new TradeAvailabilityService.TradeLine(
                "item-offer",
                "card-offer",
                condition,
                language,
                null,
                2
        );

        var targetLine = new TradeAvailabilityService.TradeLine(
                "item-target",
                "card-target",
                condition,
                language,
                "ad-1",
                1
        );

        var proposal = new TradeAvailabilityService.TradeContext(
                "recipient-1",
                "proposer-1",
                "recipient-1",
                "ad-1",
                "PENDING",
                List.of(line, line),
                List.of(targetLine)
        );

        var exception = assertThrows(
                com.pitcc.exception.TradeAvailabilityConflictException.class,
                () -> service.validate(proposal)
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                "Quantidade livre insuficiente na coleção.",
                exception.getMessage()
        );
    }

}
