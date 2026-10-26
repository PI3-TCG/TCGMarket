
package com.pitcc.service;

import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdReservationRepository;
import com.pitcc.repository.CollectionItemRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RemoveCollectionItemServiceIntegrationTest {

    @Autowired
    private CollectionItemRepository collectionItemRepository;

    @Autowired
    private AdReservationRepository reservationRepository;

    @Autowired
    private RemoveCollectionItemService service;

    private CollectionItem item;
    private String userId;

    @BeforeEach
    void setUp() {
        userId = "remove-test-" + UUID.randomUUID();

        item = collectionItemRepository.save(
                new CollectionItem(
                        userId,
                        "card-" + UUID.randomUUID(),
                        5,
                        CardCondition.NEAR_MINT,
                        CardLanguage.PORTUGUESE
                )
        );
    }

    @AfterEach
    void tearDown() {
        if (item != null && item.getId() != null) {
            collectionItemRepository.deleteById(item.getId());
        }
    }

    private AdReservation reservation(
            String adId,
            int quantity
    ) {
        return new AdReservation(
                adId,
                quantity,
                true,
                false,
                new BigDecimal("10.00"),
                Instant.now()
        );
    }

    private CollectionItem reload() {
        return collectionItemRepository
                .findById(item.getId())
                .orElseThrow();
    }

    @Test
    void shouldRemoveItemWithoutReservations() {
        service.removeCollectionItem(
                userId,
                item.getId()
        );

        assertFalse(
                collectionItemRepository.existsById(item.getId())
        );
    }

    @Test
    void shouldRejectRemovalWhenQuantityIsCommitted() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-committed", 3)
                )
        );

        assertThrows(
                CollectionItemInActiveAdException.class,
                () -> service.removeCollectionItem(
                        userId,
                        item.getId()
                )
        );

        CollectionItem updated = reload();

        assertEquals(5, updated.getQuantity());
        assertEquals(3, updated.getCommittedQuantity());
        assertEquals(1, updated.getAdReservations().size());
    }

    @Test
    void shouldRejectRemovalDuringCancellation() {
        String adId = "ad-cancelling";

        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation(adId, 3)
                )
        );

        assertTrue(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        adId
                )
        );

        assertTrue(
                reservationRepository.beginCancellation(
                        item.getId(),
                        userId,
                        adId
                )
        );

        assertThrows(
                CollectionItemInActiveAdException.class,
                () -> service.removeCollectionItem(
                        userId,
                        item.getId()
                )
        );

        CollectionItem updated = reload();

        assertEquals(3, updated.getCommittedQuantity());

        assertEquals(
                AdReservationStatus.PENDING_CANCELLATION,
                updated.getAdReservations().getFirst().getStatus()
        );
    }

    @Test
    void shouldAllowRemovalAfterReservationIsCancelled() {
        String adId = "ad-released";

        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation(adId, 3)
                )
        );

        assertTrue(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        adId
                )
        );

        assertTrue(
                reservationRepository.beginCancellation(
                        item.getId(),
                        userId,
                        adId
                )
        );

        assertTrue(
                reservationRepository.release(
                        item.getId(),
                        userId,
                        adId,
                        3,
                        AdReservationStatus.PENDING_CANCELLATION
                )
        );

        assertEquals(
                0,
                reload().getCommittedQuantity()
        );

        service.removeCollectionItem(
                userId,
                item.getId()
        );

        assertFalse(
                collectionItemRepository.existsById(item.getId())
        );
    }

    @Test
    void shouldPreventReservationAndDeletionFromBothSucceeding()
            throws Exception {

        CountDownLatch start = new CountDownLatch(1);

        try (var executor = Executors.newFixedThreadPool(2)) {

            var reservationFuture = executor.submit(() -> {
                start.await();

                return reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-concurrent", 3)
                );
            });

            var deletionFuture = executor.submit(() -> {
                start.await();

                try {
                    service.removeCollectionItem(
                            userId,
                            item.getId()
                    );

                    return true;

                } catch (
                        CollectionItemInActiveAdException
                        | CollectionItemNotFoundException exception
                ) {
                    return false;
                }
            });

            start.countDown();

            boolean reserved = reservationFuture.get(
                    15,
                    TimeUnit.SECONDS
            );

            boolean deleted = deletionFuture.get(
                    15,
                    TimeUnit.SECONDS
            );

            assertNotEquals(reserved, deleted);

            if (reserved) {
                CollectionItem updated = reload();

                assertEquals(5, updated.getQuantity());
                assertEquals(3, updated.getCommittedQuantity());
                assertEquals(1, updated.getAdReservations().size());
            } else {
                assertFalse(
                        collectionItemRepository.existsById(
                                item.getId()
                        )
                );
            }
        }
    }
}
