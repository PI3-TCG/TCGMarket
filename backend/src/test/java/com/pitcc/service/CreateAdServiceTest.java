
package com.pitcc.service;

import com.pitcc.dto.AdResponse;
import com.pitcc.dto.CreateAdRequest;
import com.pitcc.exception.AdQuantityUnavailableException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAdException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.AdReservationRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateAdServiceTest {

    @Mock
    private CollectionItemRepository collectionItemRepository;

    @Mock
    private AdRepository adRepository;

    @Mock
    private AdReservationRepository reservationRepository;

    private CreateAdService service;
    private CollectionItem item;

    @BeforeEach
    void setUp() {
        service = new CreateAdService(
                collectionItemRepository,
                adRepository,
                reservationRepository
        );

        item = collectionItem(5, 0);
    }

    private CollectionItem collectionItem(
            int quantity,
            int committed
    ) {
        CollectionItem collectionItem = new CollectionItem(
                "u1",
                "card-1",
                quantity,
                CardCondition.NEAR_MINT,
                CardLanguage.PORTUGUESE
        );

        ReflectionTestUtils.setField(
                collectionItem,
                "id",
                "item-1"
        );

        ReflectionTestUtils.setField(
                collectionItem,
                "committedQuantity",
                committed
        );

        return collectionItem;
    }

    private CreateAdRequest request(
            int quantity,
            boolean sale,
            boolean trade,
            BigDecimal price
    ) {
        return new CreateAdRequest(
                "item-1",
                quantity,
                sale,
                trade,
                price,
                null
        );
    }

    private void givenSuccessfulCreation(
            int requestedQuantity,
            int previouslyCommitted
    ) {
        CollectionItem updated = collectionItem(
                5,
                previouslyCommitted + requestedQuantity
        );

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(
                Optional.of(item),
                Optional.of(updated)
        );

        when(
                reservationRepository.reserve(
                        eq("item-1"),
                        eq("u1"),
                        any(AdReservation.class)
                )
        ).thenReturn(true);

        when(
                adRepository.insert(any(Ad.class))
        ).thenAnswer(invocation -> invocation.getArgument(0));

        when(
                reservationRepository.confirmCreation(
                        eq("item-1"),
                        eq("u1"),
                        anyString()
                )
        ).thenReturn(true);
    }

    @Test
    void shouldCreateSaleAndTradeAdForOwnItem() {
        givenSuccessfulCreation(2, 2);

        AdResponse response = service.createAd(
                "u1",
                request(
                        2,
                        true,
                        true,
                        new BigDecimal("45")
                )
        );

        ArgumentCaptor<Ad> adCaptor =
                ArgumentCaptor.forClass(Ad.class);

        ArgumentCaptor<AdReservation> reservationCaptor =
                ArgumentCaptor.forClass(AdReservation.class);

        verify(adRepository).insert(adCaptor.capture());

        verify(reservationRepository).reserve(
                eq("item-1"),
                eq("u1"),
                reservationCaptor.capture()
        );

        Ad saved = adCaptor.getValue();
        AdReservation reservation = reservationCaptor.getValue();

        assertEquals("u1", saved.getSellerId());
        assertEquals("item-1", saved.getCollectionItemId());
        assertEquals("card-1", saved.getCardId());
        assertEquals(CardCondition.NEAR_MINT, saved.getCondition());
        assertEquals(CardLanguage.PORTUGUESE, saved.getLanguage());
        assertEquals(2, saved.getQuantity());
        assertEquals(2, saved.getRemainingQuantity());
        assertTrue(saved.isSaleEnabled());
        assertTrue(saved.isTradeEnabled());
        assertEquals(new BigDecimal("45.00"), saved.getUnitPrice());
        assertEquals(AdStatus.ACTIVE, saved.getStatus());

        assertNotNull(saved.getId());
        assertEquals(saved.getId(), reservation.getAdId());
        assertEquals(saved.getId(), response.id());
        assertEquals(2, reservation.getQuantity());

        assertEquals(5, response.availability().totalQuantity());
        assertEquals(4, response.availability().committedQuantity());
        assertEquals(1, response.availability().availableQuantity());
    }

    @Test
    void shouldIgnorePriceOnTradeOnlyAd() {
        givenSuccessfulCreation(1, 0);

        service.createAd(
                "u1",
                request(
                        1,
                        false,
                        true,
                        new BigDecimal("10")
                )
        );

        ArgumentCaptor<Ad> captor =
                ArgumentCaptor.forClass(Ad.class);

        verify(adRepository).insert(captor.capture());

        assertFalse(captor.getValue().isSaleEnabled());
        assertTrue(captor.getValue().isTradeEnabled());
        assertNull(captor.getValue().getUnitPrice());
    }

    @Test
    void shouldAllowAnnouncingAllAvailableCopies() {
        givenSuccessfulCreation(3, 2);

        AdResponse response = service.createAd(
                "u1",
                request(
                        3,
                        true,
                        false,
                        new BigDecimal("1.50")
                )
        );

        assertEquals(
                5,
                response.availability().committedQuantity()
        );

        assertEquals(
                0,
                response.availability().availableQuantity()
        );
    }

    @Test
    void shouldRejectQuantityAboveAvailability() {
        CollectionItem current = collectionItem(5, 4);

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(
                Optional.of(item),
                Optional.of(current)
        );

        when(
                reservationRepository.reserve(
                        eq("item-1"),
                        eq("u1"),
                        any(AdReservation.class)
                )
        ).thenReturn(false);

        AdQuantityUnavailableException exception =
                assertThrows(
                        AdQuantityUnavailableException.class,
                        () -> service.createAd(
                                "u1",
                                request(
                                        2,
                                        true,
                                        false,
                                        new BigDecimal("10")
                                )
                        )
                );

        assertEquals(1, exception.getAvailableQuantity());

        verify(adRepository, never()).insert(any(Ad.class));

        verify(
                reservationRepository,
                never()
        ).confirmCreation(anyString(), anyString(), anyString());
    }

    @Test
    void shouldRejectItemOfAnotherUser() {
        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u2"
                )
        ).thenReturn(Optional.empty());

        assertThrows(
                CollectionItemNotFoundException.class,
                () -> service.createAd(
                        "u2",
                        request(
                                1,
                                true,
                                false,
                                new BigDecimal("10")
                        )
                )
        );

        verifyNoInteractions(
                adRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRequireAtLeastOneModality() {
        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(Optional.of(item));

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.createAd(
                        "u1",
                        request(1, false, false, null)
                )
        );

        assertEquals("modality", exception.getField());

        verifyNoInteractions(
                adRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRequirePriceWhenSaleIsEnabled() {
        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(Optional.of(item));

        InvalidAdException exception = assertThrows(
                InvalidAdException.class,
                () -> service.createAd(
                        "u1",
                        request(1, true, false, null)
                )
        );

        assertEquals("unitPrice", exception.getField());

        verifyNoInteractions(
                adRepository,
                reservationRepository
        );
    }

    @Test
    void shouldRequireAuthenticatedUser() {
        assertThrows(
                InvalidAuthenticationException.class,
                () -> service.createAd(
                        " ",
                        request(1, false, true, null)
                )
        );

        verifyNoInteractions(
                collectionItemRepository,
                adRepository,
                reservationRepository
        );
    }

    @Test
    void shouldReserveBeforePersistingAndConfirmingAd() {
        givenSuccessfulCreation(2, 0);

        AdResponse response = service.createAd(
                "u1",
                request(
                        2,
                        true,
                        false,
                        new BigDecimal("10.00")
                )
        );

        InOrder order = inOrder(
                reservationRepository,
                adRepository
        );

        order.verify(reservationRepository).reserve(
                eq("item-1"),
                eq("u1"),
                any(AdReservation.class)
        );

        order.verify(adRepository).insert(any(Ad.class));

        order.verify(reservationRepository).confirmCreation(
                eq("item-1"),
                eq("u1"),
                eq(response.id())
        );

        assertEquals(
                2,
                response.availability().committedQuantity()
        );

        assertEquals(
                3,
                response.availability().availableQuantity()
        );
    }

    @Test
    void shouldRejectWhenReservationConfirmationFails() {
        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(Optional.of(item));

        when(
                reservationRepository.reserve(
                        eq("item-1"),
                        eq("u1"),
                        any(AdReservation.class)
                )
        ).thenReturn(true);

        when(
                adRepository.insert(any(Ad.class))
        ).thenAnswer(invocation -> invocation.getArgument(0));

        when(
                reservationRepository.confirmCreation(
                        eq("item-1"),
                        eq("u1"),
                        anyString()
                )
        ).thenReturn(false);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.createAd(
                        "u1",
                        request(
                                2,
                                true,
                                false,
                                new BigDecimal("10")
                        )
                )
        );

        assertTrue(
                exception.getMessage().contains("reconciliação")
        );

        verify(reservationRepository).reserve(
                eq("item-1"),
                eq("u1"),
                any(AdReservation.class)
        );

        verify(adRepository).insert(any(Ad.class));
    }

    @Test
    void shouldNotPersistAdWhenReservationFails() {
        CollectionItem current = collectionItem(5, 5);

        when(
                collectionItemRepository.findByIdAndUserId(
                        "item-1",
                        "u1"
                )
        ).thenReturn(
                Optional.of(item),
                Optional.of(current)
        );

        when(
                reservationRepository.reserve(
                        eq("item-1"),
                        eq("u1"),
                        any(AdReservation.class)
                )
        ).thenReturn(false);

        assertThrows(
                AdQuantityUnavailableException.class,
                () -> service.createAd(
                        "u1",
                        request(
                                1,
                                true,
                                false,
                                new BigDecimal("10")
                        )
                )
        );

        verifyNoInteractions(adRepository);
    }
}
