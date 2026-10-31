
package com.pitcc.service;

import com.pitcc.dto.OwnAdFilters;
import com.pitcc.dto.OwnAdResponse;
import com.pitcc.dto.UpdateAdRequest;
import com.pitcc.exception.AdHasPendingPurchasesException;
import com.pitcc.exception.AdNotActiveException;
import com.pitcc.exception.AdNotFoundException;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdPurchaseHold;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.AdReservationRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.OwnAdRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManageAdServiceTest {

    @Mock
    private CollectionItemRepository collectionItemRepository;

    @Mock
    private AdReservationRepository reservationRepository;

    @Mock
    private AdRepository adRepository;

    @Mock
    private OwnAdRepository ownAdRepository;

    @Mock
    private CardRepository cardRepository;

    private ManageAdService service;
    private Card card;

    @BeforeEach
    void setUp() {
        service = new ManageAdService(
                adRepository,
                ownAdRepository,
                cardRepository,
                collectionItemRepository,
                reservationRepository
        );

        card = new YugiohCard(
                "Dark Magician",
                "Starter",
                "sdy",
                "006",
                "Ultra Rare",
                null,
                "46986414",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                YugiohCardType.TRAP,
                List.of()
        );

        ReflectionTestUtils.setField(card, "id", "card-1");
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private Ad ad(AdStatus status, int remaining) {
        return ad(status, 3, remaining);
    }

    private Ad ad(
            AdStatus status,
            int quantity,
            int remaining
    ) {
        CollectionItem item = new CollectionItem(
                "u1",
                "card-1",
                10,
                CardCondition.NEAR_MINT,
                CardLanguage.PORTUGUESE
        );

        ReflectionTestUtils.setField(item, "id", "item-1");

        Ad ad = new Ad(
                "u1",
                item,
                quantity,
                true,
                true,
                new BigDecimal("45.00"),
                Instant.now()
        );

        ReflectionTestUtils.setField(ad, "id", "ad-1");
        ReflectionTestUtils.setField(ad, "status", status);
        ReflectionTestUtils.setField(
                ad,
                "remainingQuantity",
                remaining
        );

        return ad;
    }

    private CollectionItem itemWithReservation(
            AdReservationStatus status,
            int reservedQuantity
    ) {
        CollectionItem item = new CollectionItem(
                "u1",
                "card-1",
                10,
                CardCondition.NEAR_MINT,
                CardLanguage.PORTUGUESE
        );

        ReflectionTestUtils.setField(item, "id", "item-1");

        AdReservation reservation = new AdReservation(
                "ad-1",
                reservedQuantity,
                true,
                true,
                new BigDecimal("45.00"),
                Instant.now()
        );

        ReflectionTestUtils.setField(
                reservation,
                "status",
                status
        );

        ReflectionTestUtils.setField(
                item,
                "committedQuantity",
                status == AdReservationStatus.CANCELLED
                        ? 0
                        : reservedQuantity
        );

        ReflectionTestUtils.setField(
                item,
                "adReservations",
                List.of(reservation)
        );

        return item;
    }

    private CollectionItem pendingUnappliedUpdate() {
        CollectionItem item = itemWithReservation(
                AdReservationStatus.PENDING_UPDATE,
                3
        );

        AdReservation reservation =
                item.getAdReservations().getFirst();

        ReflectionTestUtils.setField(
                reservation,
                "pendingOperationId",
                "op-pendente"
        );

        ReflectionTestUtils.setField(
                reservation,
                "pendingQuantity",
                4
        );

        ReflectionTestUtils.setField(
                reservation,
                "pendingSaleEnabled",
                true
        );

        ReflectionTestUtils.setField(
                reservation,
                "pendingTradeEnabled",
                false
        );

        ReflectionTestUtils.setField(
                reservation,
                "pendingUnitPrice",
                new BigDecimal("50.00")
        );

        ReflectionTestUtils.setField(
                item,
                "committedQuantity",
                4
        );

        return item;
    }

    private void givenEditableAd(Ad current) {
        when(adRepository.findByIdAndSellerId("ad-1", "u1"))
                .thenReturn(Optional.of(current));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.ACTIVE,
                                current.getRemainingQuantity()
                        )
                )
        );
    }

    private void givenSuccessfulUpdate(
            Ad current,
            Ad updated,
            boolean sale,
            boolean trade,
            BigDecimal price
    ) {
        givenEditableAd(current);

        when(
                reservationRepository.beginUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(current.getRemainingQuantity()),
                        eq(updated.getRemainingQuantity()),
                        eq(sale),
                        eq(trade),
                        eq(price)
                )
        ).thenReturn(true);

        when(
                ownAdRepository.updateQuantityIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        eq(current.getQuantity()),
                        eq(current.getRemainingQuantity()),
                        eq(updated.getQuantity()),
                        eq(updated.getRemainingQuantity()),
                        eq(sale),
                        eq(trade),
                        eq(price),
                        isNull(),
                        anyString(),
                        any(Instant.class)
                )
        ).thenReturn(Optional.of(updated));

        when(
                reservationRepository.confirmUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(current.getRemainingQuantity()),
                        eq(updated.getRemainingQuantity()),
                        eq(sale),
                        eq(trade),
                        eq(price)
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));
    }

    // =========================================================
    // LISTAGEM E SEGURANÇA
    // =========================================================

    @Test
    void shouldListOwnAdsWithCardData() {
        OwnAdFilters filters = new OwnAdFilters(
                " dark ",
                null,
                null,
                null
        );

        when(
                ownAdRepository.findOwnAds(
                        eq("u1"),
                        eq(filters),
                        any()
                )
        ).thenReturn(
                new PageImpl<>(
                        List.of(ad(AdStatus.ACTIVE, 3)),
                        PageRequest.of(0, 20),
                        1
                )
        );

        when(cardRepository.findAllById(any()))
                .thenReturn(List.of(card));

        var page = service.findOwnAds(
                "u1",
                0,
                20,
                filters
        );

        assertEquals(1, page.getTotalElements());

        OwnAdResponse response =
                page.getContent().getFirst();

        assertEquals(
                "Dark Magician",
                response.card().name()
        );

        assertEquals(
                CardCondition.NEAR_MINT,
                response.condition()
        );

        assertNull(response.releasedQuantity());
        assertEquals("dark", filters.search());
    }

    @Test
    void shouldRejectPageSizeAboveLimit() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.findOwnAds(
                        "u1",
                        0,
                        21,
                        new OwnAdFilters(
                                null, null, null, null
                        )
                )
        );

        verifyNoInteractions(ownAdRepository);
    }

    @Test
    void shouldReturnNotFoundForAdOfAnotherUser() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.empty());

        assertThrows(
                AdNotFoundException.class,
                () -> service.findOwnAd("u1", "ad-1")
        );
    }

    @Test
    void shouldRejectAbortedCreationMarker() {
        Ad marker = ad(AdStatus.CANCELLED, 0);

        ReflectionTestUtils.setField(
                marker,
                "creationAborted",
                true
        );

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(marker));

        assertThrows(
                AdNotFoundException.class,
                () -> service.findOwnAd("u1", "ad-1")
        );

        verifyNoInteractions(cardRepository);
    }

    // =========================================================
    // EDIÇÃO DE ANÚNCIOS
    // =========================================================

    @Test
    void shouldUpdateModalityAndPriceOfActiveAd() {
        Ad current = ad(AdStatus.ACTIVE, 3, 3);
        Ad updated = ad(AdStatus.ACTIVE, 3, 3);

        BigDecimal price = new BigDecimal("50.00");

        givenSuccessfulUpdate(
                current,
                updated,
                true,
                false,
                price
        );

        OwnAdResponse response = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        false,
                        new BigDecimal("50")
                )
        );

        assertEquals("ad-1", response.id());

        verify(ownAdRepository, never()).updateIfActive(
                anyString(),
                anyString(),
                anyBoolean(),
                anyBoolean(),
                any(),
                any()
        );
    }

    @Test
    void shouldDropPriceWhenOnlyTradeIsEnabled() {
        Ad current = ad(AdStatus.ACTIVE, 3);
        Ad updated = ad(AdStatus.ACTIVE, 3);

        givenSuccessfulUpdate(
                current,
                updated,
                false,
                true,
                null
        );

        service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        false,
                        true,
                        new BigDecimal("50")
                )
        );

        verify(ownAdRepository).updateQuantityIfActive(
                eq("ad-1"),
                eq("u1"),
                eq(3),
                eq(3),
                eq(3),
                eq(3),
                eq(false),
                eq(true),
                isNull(),
                isNull(),
                anyString(),
                any(Instant.class)
        );
    }

    @Test
    void shouldIncreaseAdvertisedQuantity() {
        Ad current = ad(AdStatus.ACTIVE, 3, 3);
        Ad updated = ad(AdStatus.ACTIVE, 5, 5);

        givenSuccessfulUpdate(
                current,
                updated,
                true,
                false,
                new BigDecimal("50.00")
        );

        OwnAdResponse response = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        false,
                        new BigDecimal("50"),
                        5
                )
        );

        assertEquals(5, response.quantity());
        assertEquals(5, response.remainingQuantity());

        ArgumentCaptor<String> preparedOperation =
                ArgumentCaptor.forClass(String.class);

        ArgumentCaptor<String> appliedOperation =
                ArgumentCaptor.forClass(String.class);

        ArgumentCaptor<String> confirmedOperation =
                ArgumentCaptor.forClass(String.class);

        verify(reservationRepository).beginUpdate(
                eq("item-1"),
                eq("u1"),
                eq("ad-1"),
                preparedOperation.capture(),
                eq(3),
                eq(5),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00"))
        );

        verify(ownAdRepository).updateQuantityIfActive(
                eq("ad-1"),
                eq("u1"),
                eq(3),
                eq(3),
                eq(5),
                eq(5),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00")),
                isNull(),
                appliedOperation.capture(),
                any(Instant.class)
        );

        verify(reservationRepository).confirmUpdate(
                eq("item-1"),
                eq("u1"),
                eq("ad-1"),
                confirmedOperation.capture(),
                eq(3),
                eq(5),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00"))
        );

        assertEquals(
                preparedOperation.getValue(),
                appliedOperation.getValue()
        );

        assertEquals(
                preparedOperation.getValue(),
                confirmedOperation.getValue()
        );
    }

    @Test
    void shouldReduceAdvertisedQuantity() {
        Ad current = ad(AdStatus.ACTIVE, 3, 3);
        Ad updated = ad(AdStatus.ACTIVE, 2, 2);

        givenSuccessfulUpdate(
                current,
                updated,
                true,
                false,
                new BigDecimal("50.00")
        );

        OwnAdResponse response = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        false,
                        new BigDecimal("50"),
                        2
                )
        );

        assertEquals(2, response.quantity());
        assertEquals(2, response.remainingQuantity());

        verify(reservationRepository).confirmUpdate(
                eq("item-1"),
                eq("u1"),
                eq("ad-1"),
                anyString(),
                eq(3),
                eq(2),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00"))
        );
    }

    @Test
    void shouldPreserveSoldQuantityWhenEditing() {
        Ad current = ad(AdStatus.ACTIVE, 3, 2);
        Ad updated = ad(AdStatus.ACTIVE, 5, 4);

        givenSuccessfulUpdate(
                current,
                updated,
                true,
                false,
                new BigDecimal("50.00")
        );

        OwnAdResponse response = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        false,
                        new BigDecimal("50"),
                        5
                )
        );

        assertEquals(5, response.quantity());
        assertEquals(4, response.remainingQuantity());

        verify(ownAdRepository).updateQuantityIfActive(
                eq("ad-1"),
                eq("u1"),
                eq(3),
                eq(2),
                eq(5),
                eq(4),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00")),
                isNull(),
                anyString(),
                any(Instant.class)
        );
    }

    // =========================================================
    // RECUPERAÇÃO: EDIÇÃO JÁ APLICADA
    // =========================================================

    @Test
    void shouldConfirmAppliedPendingEditOnRetryWithoutReservingAgain() {
        Ad applied = ad(AdStatus.ACTIVE, 4, 4);

        ReflectionTestUtils.setField(
                applied,
                "lastAppliedUpdateOperationId",
                "op-previous"
        );

        ReflectionTestUtils.setField(
                applied,
                "tradeEnabled",
                false
        );

        ReflectionTestUtils.setField(
                applied,
                "unitPrice",
                new BigDecimal("50.00")
        );

        CollectionItem pendingItem = itemWithReservation(
                AdReservationStatus.PENDING_UPDATE,
                3
        );

        AdReservation pending =
                pendingItem.getAdReservations().getFirst();

        ReflectionTestUtils.setField(
                pending,
                "pendingOperationId",
                "op-previous"
        );

        ReflectionTestUtils.setField(
                pending,
                "pendingQuantity",
                4
        );

        ReflectionTestUtils.setField(
                pending,
                "pendingSaleEnabled",
                true
        );

        ReflectionTestUtils.setField(
                pending,
                "pendingTradeEnabled",
                false
        );

        ReflectionTestUtils.setField(
                pending,
                "pendingUnitPrice",
                new BigDecimal("50.00")
        );

        ReflectionTestUtils.setField(
                pendingItem,
                "committedQuantity",
                4
        );

        CollectionItem activeItem = itemWithReservation(
                AdReservationStatus.ACTIVE,
                4
        );

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(applied));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(pendingItem),
                Optional.of(activeItem)
        );

        when(
                reservationRepository.confirmUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        eq("op-previous"),
                        eq(3),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("50.00"))
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse result = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        false,
                        new BigDecimal("50"),
                        4
                )
        );

        assertEquals(4, result.quantity());
        assertEquals(4, result.remainingQuantity());

        verify(reservationRepository).confirmUpdate(
                eq("item-1"),
                eq("u1"),
                eq("ad-1"),
                eq("op-previous"),
                eq(3),
                eq(4),
                eq(true),
                eq(false),
                eq(new BigDecimal("50.00"))
        );

        verify(reservationRepository, never()).beginUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt(),
                anyBoolean(),
                anyBoolean(),
                any()
        );

        verifyNoInteractions(ownAdRepository);
    }

    // =========================================================
    // RECUPERAÇÃO: EDIÇÃO NÃO APLICADA
    // =========================================================

    @Test
    void shouldRecoverUnappliedPendingEditBeforeRetry() {
        Ad current = ad(AdStatus.ACTIVE, 3, 3);

        CollectionItem pendingItem = pendingUnappliedUpdate();

        CollectionItem restoredItem = itemWithReservation(
                AdReservationStatus.ACTIVE,
                3
        );

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(current));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(pendingItem),
                Optional.of(restoredItem)
        );

        when(
                ownAdRepository.fenceUnappliedUpdate(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        isNull(),
                        startsWith("fence-"),
                        any(Instant.class)
                )
        ).thenReturn(true);

        when(
                reservationRepository.abortUpdate(
                        "item-1",
                        "u1",
                        "ad-1",
                        "op-pendente",
                        3,
                        4
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse result = service.updateOwnAd(
                "u1",
                "ad-1",
                new UpdateAdRequest(
                        true,
                        true,
                        new BigDecimal("45.00"),
                        3
                )
        );

        assertEquals(3, result.quantity());
        assertEquals(3, result.remainingQuantity());

        verify(ownAdRepository).fenceUnappliedUpdate(
                eq("ad-1"),
                eq("u1"),
                eq(3),
                eq(3),
                isNull(),
                startsWith("fence-"),
                any(Instant.class)
        );

        verify(reservationRepository).abortUpdate(
                "item-1",
                "u1",
                "ad-1",
                "op-pendente",
                3,
                4
        );

        verify(reservationRepository, never()).beginUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt(),
                anyBoolean(),
                anyBoolean(),
                any()
        );
    }

    @Test
    void shouldKeepPendingReservationWhenFencingFails() {
        Ad current = ad(AdStatus.ACTIVE, 3, 3);

        CollectionItem pendingItem = pendingUnappliedUpdate();

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(current));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(Optional.of(pendingItem));

        when(
                ownAdRepository.fenceUnappliedUpdate(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        isNull(),
                        startsWith("fence-"),
                        any(Instant.class)
                )
        ).thenReturn(false);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                new BigDecimal("50.00"),
                                4
                        )
                )
        );

        assertTrue(
                exception.getMessage().contains(
                        "A edição mudou durante a recuperação"
                )
        );

        verify(reservationRepository, never()).abortUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt()
        );
    }

    // =========================================================
    // VALIDAÇÕES DE EDIÇÃO
    // =========================================================

    @Test
    void shouldRequireModalityAndPriceWhenUpdating() {
        InvalidAdException noModality = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                false,
                                false,
                                null
                        )
                )
        );

        assertEquals(
                "modality",
                noModality.getField()
        );

        InvalidAdException noPrice = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                null
                        )
                )
        );

        assertEquals("unitPrice", noPrice.getField());

        verifyNoInteractions(
                adRepository,
                ownAdRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRejectUpdateWhenAdIsNoLongerActive() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        ad(AdStatus.SOLD_OUT, 0)
                )
        );

        AdNotActiveException exception = assertThrows(
                AdNotActiveException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                true,
                                new BigDecimal("10")
                        )
                )
        );

        assertEquals(
                AdStatus.SOLD_OUT,
                exception.getCurrentStatus()
        );

        verifyNoInteractions(
                ownAdRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRejectUpdateOfAdFromAnotherUser() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u2"
                )
        ).thenReturn(Optional.empty());

        assertThrows(
                AdNotFoundException.class,
                () -> service.updateOwnAd(
                        "u2",
                        "ad-1",
                        new UpdateAdRequest(
                                false,
                                true,
                                null
                        )
                )
        );

        verifyNoInteractions(
                ownAdRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRejectQuantityNotAboveSoldCopies() {
        Ad current = ad(AdStatus.ACTIVE, 3, 2);

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(current));

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                new BigDecimal("10"),
                                1
                        )
                )
        );

        assertEquals("quantity", exception.getField());

        verifyNoInteractions(
                reservationRepository,
                ownAdRepository
        );
    }

    @Test
    void shouldRejectUpdateWhenQuantityIsUnavailable() {
        Ad current = ad(AdStatus.ACTIVE, 3);

        CollectionItem initiallyLoaded =
                itemWithReservation(
                        AdReservationStatus.ACTIVE,
                        3
                );

        CollectionItem latest = itemWithReservation(
                AdReservationStatus.ACTIVE,
                3
        );

        ReflectionTestUtils.setField(
                latest,
                "quantity",
                5
        );

        ReflectionTestUtils.setField(
                latest,
                "committedQuantity",
                4
        );

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(current));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(initiallyLoaded),
                Optional.of(latest)
        );

        when(
                reservationRepository.beginUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(5),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00"))
                )
        ).thenReturn(false);

        AdQuantityUnavailableException exception =
                assertThrows(
                        AdQuantityUnavailableException.class,
                        () -> service.updateOwnAd(
                                "u1",
                                "ad-1",
                                new UpdateAdRequest(
                                        true,
                                        false,
                                        new BigDecimal("10"),
                                        5
                                )
                        )
                );

        assertEquals(
                1,
                exception.getAvailableQuantity()
        );

        verifyNoInteractions(ownAdRepository);
    }

    // =========================================================
    // FALHAS DURANTE ATUALIZAÇÃO
    // =========================================================

    @Test
    void shouldAbortPreparationWhenAdWasNotUpdated() {
        Ad current = ad(AdStatus.ACTIVE, 3);

        givenEditableAd(current);

        when(
                reservationRepository.beginUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00"))
                )
        ).thenReturn(true);

        when(
                ownAdRepository.updateQuantityIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        eq(4),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00")),
                        isNull(),
                        anyString(),
                        any(Instant.class)
                )
        ).thenReturn(Optional.empty());

        when(
                reservationRepository.abortUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(4)
                )
        ).thenReturn(true);

        assertThrows(
                IllegalStateException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                new BigDecimal("10"),
                                4
                        )
                )
        );

        verify(reservationRepository).abortUpdate(
                eq("item-1"),
                eq("u1"),
                eq("ad-1"),
                anyString(),
                eq(3),
                eq(4)
        );
    }

    @Test
    void shouldKeepReservationPendingWhenAdWriteFails() {
        Ad current = ad(AdStatus.ACTIVE, 3);

        givenEditableAd(current);

        when(
                reservationRepository.beginUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00"))
                )
        ).thenReturn(true);

        when(
                ownAdRepository.updateQuantityIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        eq(4),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00")),
                        isNull(),
                        anyString(),
                        any(Instant.class)
                )
        ).thenThrow(
                new IllegalStateException(
                        "Falha de comunicação"
                )
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                new BigDecimal("10"),
                                4
                        )
                )
        );

        assertTrue(
                exception.getMessage().contains(
                        "reconciliação"
                )
        );

        verify(reservationRepository, never()).abortUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt()
        );

        verify(reservationRepository, never()).confirmUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt(),
                anyBoolean(),
                anyBoolean(),
                any()
        );
    }

    @Test
    void shouldReportFailedReservationConfirmation() {
        Ad current = ad(AdStatus.ACTIVE, 3);
        Ad updated = ad(AdStatus.ACTIVE, 4, 4);

        givenEditableAd(current);

        when(
                reservationRepository.beginUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00"))
                )
        ).thenReturn(true);

        when(
                ownAdRepository.updateQuantityIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        eq(4),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00")),
                        isNull(),
                        anyString(),
                        any(Instant.class)
                )
        ).thenReturn(Optional.of(updated));

        when(
                reservationRepository.confirmUpdate(
                        eq("item-1"),
                        eq("u1"),
                        eq("ad-1"),
                        anyString(),
                        eq(3),
                        eq(4),
                        eq(true),
                        eq(false),
                        eq(new BigDecimal("10.00"))
                )
        ).thenReturn(false);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(
                                true,
                                false,
                                new BigDecimal("10"),
                                4
                        )
                )
        );

        assertTrue(
                exception.getMessage().contains(
                        "reconciliação"
                )
        );

        verify(reservationRepository, never()).abortUpdate(
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyInt(),
                anyInt()
        );
    }

    // =========================================================
    // CANCELAMENTO
    // =========================================================

    @Test
    void shouldCancelAdAndReleaseReservation() {
        Ad active = ad(AdStatus.ACTIVE, 3);
        Ad cancelled = ad(AdStatus.CANCELLED, 3);

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(active));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.ACTIVE,
                                3
                        )
                )
        );

        when(
                reservationRepository.beginCancellation(
                        "item-1",
                        "u1",
                        "ad-1"
                )
        ).thenReturn(true);

        when(
                ownAdRepository.cancelIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        any(Instant.class)
                )
        ).thenReturn(Optional.of(cancelled));

        when(
                reservationRepository.release(
                        "item-1",
                        "u1",
                        "ad-1",
                        3,
                        AdReservationStatus.PENDING_CANCELLATION
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse response = service.cancelOwnAd(
                "u1",
                "ad-1"
        );

        assertEquals(
                AdStatus.CANCELLED,
                response.status()
        );

        assertEquals(
                3,
                response.releasedQuantity()
        );

        InOrder order = inOrder(
                reservationRepository,
                ownAdRepository
        );

        order.verify(reservationRepository)
                .beginCancellation(
                        "item-1", "u1", "ad-1"
                );

        order.verify(ownAdRepository)
                .cancelIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        any(Instant.class)
                );

        order.verify(reservationRepository)
                .release(
                        "item-1",
                        "u1",
                        "ad-1",
                        3,
                        AdReservationStatus.PENDING_CANCELLATION
                );
    }

    @Test
    void shouldTreatRepeatedCancelAsIdempotent() {
        Ad cancelled = ad(AdStatus.CANCELLED, 3);

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(cancelled));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.CANCELLED,
                                3
                        )
                )
        );

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse response = service.cancelOwnAd(
                "u1",
                "ad-1"
        );

        assertEquals(
                AdStatus.CANCELLED,
                response.status()
        );

        verifyNoInteractions(
                reservationRepository,
                ownAdRepository
        );
    }

    @Test
    void shouldResumeCancellationWhenAdIsAlreadyCancelled() {
        Ad cancelled = ad(AdStatus.CANCELLED, 3);

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(cancelled));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.PENDING_CANCELLATION,
                                3
                        )
                )
        );

        when(
                reservationRepository.release(
                        "item-1",
                        "u1",
                        "ad-1",
                        3,
                        AdReservationStatus.PENDING_CANCELLATION
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse response = service.cancelOwnAd(
                "u1",
                "ad-1"
        );

        assertEquals(
                AdStatus.CANCELLED,
                response.status()
        );

        verify(reservationRepository).release(
                "item-1",
                "u1",
                "ad-1",
                3,
                AdReservationStatus.PENDING_CANCELLATION
        );

        verifyNoInteractions(ownAdRepository);
    }

    // =========================================================
    // CANCELAMENTO APÓS RECUPERAÇÃO
    // =========================================================

    @Test
    void shouldCancelAfterRecoveringUnappliedPendingUpdate() {
        Ad active = ad(AdStatus.ACTIVE, 3);
        Ad cancelled = ad(AdStatus.CANCELLED, 3);

        CollectionItem pendingItem = pendingUnappliedUpdate();

        CollectionItem restoredItem = itemWithReservation(
                AdReservationStatus.ACTIVE,
                3
        );

        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(Optional.of(active));

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(pendingItem),
                Optional.of(restoredItem)
        );

        when(
                ownAdRepository.fenceUnappliedUpdate(
                        eq("ad-1"),
                        eq("u1"),
                        eq(3),
                        eq(3),
                        isNull(),
                        startsWith("fence-"),
                        any(Instant.class)
                )
        ).thenReturn(true);

        when(
                reservationRepository.abortUpdate(
                        "item-1",
                        "u1",
                        "ad-1",
                        "op-pendente",
                        3,
                        4
                )
        ).thenReturn(true);

        when(
                reservationRepository.beginCancellation(
                        "item-1",
                        "u1",
                        "ad-1"
                )
        ).thenReturn(true);

        when(
                ownAdRepository.cancelIfActive(
                        eq("ad-1"),
                        eq("u1"),
                        any(Instant.class)
                )
        ).thenReturn(Optional.of(cancelled));

        when(
                reservationRepository.release(
                        "item-1",
                        "u1",
                        "ad-1",
                        3,
                        AdReservationStatus.PENDING_CANCELLATION
                )
        ).thenReturn(true);

        when(cardRepository.findById("card-1"))
                .thenReturn(Optional.of(card));

        OwnAdResponse result = service.cancelOwnAd(
                "u1",
                "ad-1"
        );

        assertEquals(
                AdStatus.CANCELLED,
                result.status()
        );

        assertEquals(
                3,
                result.releasedQuantity()
        );

        InOrder order = inOrder(
                ownAdRepository,
                reservationRepository
        );

        order.verify(ownAdRepository).fenceUnappliedUpdate(
                eq("ad-1"),
                eq("u1"),
                eq(3),
                eq(3),
                isNull(),
                startsWith("fence-"),
                any(Instant.class)
        );

        order.verify(reservationRepository).abortUpdate(
                "item-1",
                "u1",
                "ad-1",
                "op-pendente",
                3,
                4
        );

        order.verify(reservationRepository).beginCancellation(
                "item-1",
                "u1",
                "ad-1"
        );

        order.verify(ownAdRepository).cancelIfActive(
                eq("ad-1"),
                eq("u1"),
                any(Instant.class)
        );

        order.verify(reservationRepository).release(
                "item-1",
                "u1",
                "ad-1",
                3,
                AdReservationStatus.PENDING_CANCELLATION
        );
    }

    // =========================================================
    // CANCELAMENTO: VALIDAÇÕES
    // =========================================================

    @Test
    void shouldRejectCancelOfSoldOutAd() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        ad(AdStatus.SOLD_OUT, 0)
                )
        );

        assertThrows(
                AdNotActiveException.class,
                () -> service.cancelOwnAd(
                        "u1", "ad-1"
                )
        );

        verifyNoInteractions(
                collectionItemRepository,
                reservationRepository,
                ownAdRepository
        );
    }

    @Test
    void shouldRejectCancelWhenReservationQuantityDiffers() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        ad(AdStatus.ACTIVE, 2)
                )
        );

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.ACTIVE,
                                3
                        )
                )
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.cancelOwnAd(
                        "u1", "ad-1"
                )
        );

        verifyNoInteractions(
                reservationRepository,
                ownAdRepository
        );
    }

    @Test
    void shouldRejectCancelWhenReservationAlreadyCancelled() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        ad(AdStatus.ACTIVE, 3)
                )
        );

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.CANCELLED,
                                3
                        )
                )
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.cancelOwnAd(
                        "u1", "ad-1"
                )
        );

        verifyNoInteractions(
                reservationRepository,
                ownAdRepository
        );
    }

    @Test
    void shouldRejectCancelDuringInvalidPendingUpdate() {
        when(
                adRepository.findByIdAndSellerId(
                        "ad-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        ad(AdStatus.ACTIVE, 3)
                )
        );

        // Reserva pendente sem operationId e sem quantidade-alvo:
        // não é seguro confirmar nem abortar.
        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1", "u1"
                )
        ).thenReturn(
                Optional.of(
                        itemWithReservation(
                                AdReservationStatus.PENDING_UPDATE,
                                3
                        )
                )
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.cancelOwnAd(
                        "u1", "ad-1"
                )
        );

        assertTrue(
                exception.getMessage().contains(
                        "dados inválidos"
                )
        );

        verifyNoInteractions(
                reservationRepository,
                ownAdRepository
        );
    }

    // =========================================================
    // COMPRAS AGUARDANDO PAGAMENTO
    // =========================================================

    private Ad withPurchaseHold(Ad ad, int quantity) {
        ReflectionTestUtils.setField(
                ad,
                "purchaseHolds",
                List.of(new AdPurchaseHold("order-1", quantity, Instant.now()))
        );
        return ad;
    }

    @Test
    void shouldRejectQuantityBelowPurchaseHolds() {
        givenEditableAd(withPurchaseHold(ad(AdStatus.ACTIVE, 3, 3), 2));

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(true, false, new BigDecimal("10"), 1)
                )
        );

        assertEquals("quantity", exception.getField());
        verifyNoInteractions(ownAdRepository);
    }

    @Test
    void shouldRejectDisablingSaleWithPurchaseHolds() {
        givenEditableAd(withPurchaseHold(ad(AdStatus.ACTIVE, 3, 3), 1));

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(false, true, null, 3)
                )
        );

        assertEquals("saleEnabled", exception.getField());
        verifyNoInteractions(ownAdRepository);
    }

    @Test
    void shouldReportPurchaseHoldCreatedDuringEdit() {
        Ad current = ad(AdStatus.ACTIVE, 3);
        givenEditableAd(current);
        when(adRepository.findByIdAndSellerId("ad-1", "u1"))
                .thenReturn(
                        Optional.of(current),
                        Optional.of(withPurchaseHold(ad(AdStatus.ACTIVE, 3), 3))
                );
        when(reservationRepository.beginUpdate(
                eq("item-1"), eq("u1"), eq("ad-1"), anyString(),
                eq(3), eq(2), eq(true), eq(false), eq(new BigDecimal("10.00"))
        )).thenReturn(true);
        when(ownAdRepository.updateQuantityIfActive(
                eq("ad-1"), eq("u1"), eq(3), eq(3), eq(2), eq(2), eq(true), eq(false),
                eq(new BigDecimal("10.00")), isNull(), anyString(), any(Instant.class)
        )).thenReturn(Optional.empty());
        when(reservationRepository.abortUpdate(
                eq("item-1"), eq("u1"), eq("ad-1"), anyString(), eq(3), eq(2)
        )).thenReturn(true);

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.updateOwnAd(
                        "u1",
                        "ad-1",
                        new UpdateAdRequest(true, false, new BigDecimal("10"), 2)
                )
        );

        assertEquals("quantity", exception.getField());
    }

    @Test
    void shouldUndoCancellationWhenPurchaseHoldAppearsDuringCancel() {
        when(adRepository.findByIdAndSellerId("ad-1", "u1"))
                .thenReturn(
                        Optional.of(ad(AdStatus.ACTIVE, 3)),
                        Optional.of(withPurchaseHold(ad(AdStatus.ACTIVE, 3), 1))
                );
        when(collectionItemRepository.findByIdAndUserId("item-1", "u1"))
                .thenReturn(Optional.of(itemWithReservation(AdReservationStatus.ACTIVE, 3)));
        when(reservationRepository.beginCancellation("item-1", "u1", "ad-1"))
                .thenReturn(true);
        when(ownAdRepository.cancelIfActive(eq("ad-1"), eq("u1"), any(Instant.class)))
                .thenReturn(Optional.empty());

        assertThrows(
                AdHasPendingPurchasesException.class,
                () -> service.cancelOwnAd("u1", "ad-1")
        );

        verify(reservationRepository).abortCancellation("item-1", "u1", "ad-1");
        verify(reservationRepository, never()).release(
                anyString(), anyString(), anyString(), anyInt(), any()
        );
    }

    @Test
    void shouldRejectCancelWithPurchaseHolds() {
        when(adRepository.findByIdAndSellerId("ad-1", "u1"))
                .thenReturn(Optional.of(withPurchaseHold(ad(AdStatus.ACTIVE, 3), 1)));

        assertThrows(
                AdHasPendingPurchasesException.class,
                () -> service.cancelOwnAd("u1", "ad-1")
        );

        verifyNoInteractions(
                collectionItemRepository,
                reservationRepository,
                ownAdRepository
        );
    }

    // =========================================================
    // AUTENTICAÇÃO
    // =========================================================

    @Test
    void shouldRequireAuthenticatedUser() {
        assertThrows(
                InvalidAuthenticationException.class,
                () -> service.cancelOwnAd(
                        " ", "ad-1"
                )
        );

        verifyNoInteractions(
                adRepository,
                ownAdRepository,
                collectionItemRepository,
                reservationRepository
        );
    }
}
