package com.pitcc.repository;

import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;

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
class AdReservationRepositoryIntegrationTest {

    @Autowired
    private AdReservationRepository reservationRepository;

    @Autowired
    private CollectionItemRepository collectionItemRepository;

    private CollectionItem item;
    private String userId;

    @BeforeEach
    void setUp() {
        userId = "reservation-test-" + UUID.randomUUID();

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

    private AdReservation reservation(String adId, int quantity) {
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
    void shouldPreventOversellingUnderConcurrency() throws Exception {
        var start = new CountDownLatch(1);

        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await();

                return reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-a", 4)
                );
            });

            var second = executor.submit(() -> {
                start.await();

                return reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-b", 3)
                );
            });

            start.countDown();

            boolean resultA = first.get(15, TimeUnit.SECONDS);
            boolean resultB = second.get(15, TimeUnit.SECONDS);

            assertNotEquals(resultA, resultB);

            CollectionItem updated = reload();

            int expectedCommitted = resultA ? 4 : 3;

            assertEquals(
                    expectedCommitted,
                    updated.getCommittedQuantity()
            );

            assertEquals(
                    1,
                    updated.getAdReservations().size()
            );

            assertEquals(
                    expectedCommitted,
                    updated.getAdReservations().getFirst().getQuantity()
            );

            assertEquals(
                    AdReservationStatus.PENDING_CREATION,
                    updated.getAdReservations().getFirst().getStatus()
            );

            assertTrue(
                    updated.getCommittedQuantity()
                            <= updated.getQuantity()
            );
        }
    }

    @Test
    void shouldRejectReservationAboveAvailableQuantity() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-first", 3)
                )
        );

        assertFalse(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-second", 3)
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                5,
                updated.getQuantity()
        );

        assertEquals(
                3,
                updated.getCommittedQuantity()
        );

        assertEquals(
                1,
                updated.getAdReservations().size()
        );
    }

    @Test
    void shouldAllowReservingExactAvailableQuantity() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-exact", 5)
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                5,
                updated.getCommittedQuantity()
        );

        assertEquals(
                1,
                updated.getAdReservations().size()
        );

        assertFalse(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-extra", 1)
                )
        );
    }

    @Test
    void shouldRejectDuplicateReservationId() {
        AdReservation reservation = reservation("ad-123", 2);

        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation
                )
        );

        assertFalse(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                2,
                updated.getCommittedQuantity()
        );

        assertEquals(
                1,
                updated.getAdReservations().size()
        );
    }

    @Test
    void shouldRejectReservationFromAnotherUser() {
        boolean result = reservationRepository.reserve(
                item.getId(),
                "another-user",
                reservation("ad-456", 2)
        );

        assertFalse(result);

        CollectionItem updated = reload();

        assertEquals(
                0,
                updated.getCommittedQuantity()
        );

        assertTrue(
                updated.getAdReservations().isEmpty()
        );
    }

    @Test
    void shouldConfirmReservationAfterAdCreation() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-confirm", 3)
                )
        );

        assertTrue(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        "ad-confirm"
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                3,
                updated.getCommittedQuantity()
        );

        assertEquals(
                AdReservationStatus.ACTIVE,
                updated.getAdReservations().getFirst().getStatus()
        );

        assertFalse(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        "ad-confirm"
                )
        );
    }

    @Test
    void shouldReleaseReservationOnlyOnce() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-cancel", 3)
                )
        );

        assertTrue(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        "ad-cancel"
                )
        );

        assertTrue(
                reservationRepository.release(
                        item.getId(),
                        userId,
                        "ad-cancel",
                        3,
                        AdReservationStatus.ACTIVE
                )
        );

        assertFalse(
                reservationRepository.release(
                        item.getId(),
                        userId,
                        "ad-cancel",
                        3,
                        AdReservationStatus.ACTIVE
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                0,
                updated.getCommittedQuantity()
        );

        assertEquals(
                AdReservationStatus.CANCELLED,
                updated.getAdReservations().getFirst().getStatus()
        );
    }

    @Test
    void shouldBeginCancellationWithoutReleasingQuantity() {
        assertTrue(
                reservationRepository.reserve(
                        item.getId(),
                        userId,
                        reservation("ad-cancel-test", 3)
                )
        );

        assertTrue(
                reservationRepository.confirmCreation(
                        item.getId(),
                        userId,
                        "ad-cancel-test"
                )
        );

        assertTrue(
                reservationRepository.beginCancellation(
                        item.getId(),
                        userId,
                        "ad-cancel-test"
                )
        );

        CollectionItem updated = reload();

        assertEquals(
                AdReservationStatus.PENDING_CANCELLATION,
                updated.getAdReservations().getFirst().getStatus()
        );

        assertEquals(
                3,
                updated.getCommittedQuantity()
        );

        assertFalse(
                reservationRepository.beginCancellation(
                        item.getId(),
                        userId,
                        "ad-cancel-test"
                )
        );
    }


    private void activate(String adId, int quantity) {
        assertTrue(reservationRepository.reserve(
                item.getId(),
                userId,
                reservation(adId, quantity)
        ));

        assertTrue(reservationRepository.confirmCreation(
                item.getId(),
                userId,
                adId
        ));
    }

    private AdReservation findReservation(String adId) {
        return reload().getAdReservations()
                .stream()
                .filter(existing -> adId.equals(existing.getAdId()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void shouldIncreaseQuantityOnlyAfterAtomicallyReservingAdditionalCopies() {
        activate("ad-edit", 2);
        String operationId = UUID.randomUUID().toString();
        BigDecimal price = new BigDecimal("22.00");

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, true, price
        ));

        CollectionItem pending = reload();
        AdReservation reservation = findReservation("ad-edit");

        assertEquals(4, pending.getCommittedQuantity());
        assertEquals(2, reservation.getQuantity());
        assertEquals(4, reservation.getPendingQuantity());
        assertEquals(operationId, reservation.getPendingOperationId());
        assertEquals(AdReservationStatus.PENDING_UPDATE, reservation.getStatus());

        assertTrue(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, true, price
        ));

        CollectionItem confirmed = reload();
        AdReservation active = findReservation("ad-edit");

        assertEquals(4, confirmed.getCommittedQuantity());
        assertEquals(4, active.getQuantity());
        assertEquals(AdReservationStatus.ACTIVE, active.getStatus());
        assertTrue(active.isSaleEnabled());
        assertTrue(active.isTradeEnabled());
        assertEquals(0, price.compareTo(active.getUnitPrice()));
        assertNull(active.getPendingOperationId());
        assertNull(active.getPendingQuantity());
        assertNull(active.getPendingSaleEnabled());
        assertNull(active.getPendingTradeEnabled());
        assertNull(active.getPendingUnitPrice());

        assertFalse(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, true, price
        ));
        assertEquals(4, reload().getCommittedQuantity());
    }

    @Test
    void shouldRejectIncreaseWhenInsufficientCopiesAreAvailable() {
        activate("ad-first", 3);
        activate("ad-second", 1);

        assertFalse(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-first", UUID.randomUUID().toString(),
                3, 5, true, false, new BigDecimal("10.00")
        ));

        assertEquals(4, reload().getCommittedQuantity());
        assertEquals(3, findReservation("ad-first").getQuantity());
        assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-first").getStatus());
    }

    @Test
    void shouldReleaseReducedQuantityOnlyUponConfirmation() {
        activate("ad-edit", 4);
        String operationId = UUID.randomUUID().toString();
        BigDecimal price = new BigDecimal("10.00");

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                4, 2, true, false, price
        ));

        assertEquals(4, reload().getCommittedQuantity());
        assertEquals(4, findReservation("ad-edit").getQuantity());
        assertEquals(2, findReservation("ad-edit").getPendingQuantity());

        assertFalse(reservationRepository.reserve(
                item.getId(), userId, reservation("other-ad", 2)
        ));

        assertTrue(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                4, 2, true, false, price
        ));

        assertEquals(2, reload().getCommittedQuantity());
        assertEquals(2, findReservation("ad-edit").getQuantity());
        assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-edit").getStatus());

        assertTrue(reservationRepository.reserve(
                item.getId(), userId, reservation("other-ad", 3)
        ));
        assertEquals(5, reload().getCommittedQuantity());
    }

    @Test
    void shouldAbortIncreaseAndReturnOnlyAdditionalReservedCopies() {
        activate("ad-edit", 2);
        String operationId = UUID.randomUUID().toString();

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, false, new BigDecimal("10.00")
        ));

        assertEquals(4, reload().getCommittedQuantity());

        assertTrue(reservationRepository.abortUpdate(
                item.getId(), userId, "ad-edit", operationId, 2, 4
        ));

        assertEquals(2, reload().getCommittedQuantity());
        AdReservation active = findReservation("ad-edit");
        assertEquals(2, active.getQuantity());
        assertEquals(AdReservationStatus.ACTIVE, active.getStatus());
        assertNull(active.getPendingOperationId());
        assertNull(active.getPendingQuantity());

        assertFalse(reservationRepository.abortUpdate(
                item.getId(), userId, "ad-edit", operationId, 2, 4
        ));
        assertEquals(2, reload().getCommittedQuantity());

        assertTrue(reservationRepository.reserve(
                item.getId(), userId, reservation("another-ad", 3)
        ));
        assertEquals(5, reload().getCommittedQuantity());
    }

    @Test
    void shouldAbortReductionWithoutReleasingAnyCopies() {
        activate("ad-edit", 4);
        String operationId = UUID.randomUUID().toString();

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                4, 2, true, false, new BigDecimal("10.00")
        ));

        assertTrue(reservationRepository.abortUpdate(
                item.getId(), userId, "ad-edit", operationId, 4, 2
        ));

        assertEquals(4, reload().getCommittedQuantity());
        assertEquals(4, findReservation("ad-edit").getQuantity());
        assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-edit").getStatus());
        assertNull(findReservation("ad-edit").getPendingQuantity());
    }

    @Test
    void shouldRejectStaleQuantityAndForeignUserDuringUpdate() {
        activate("ad-edit", 2);
        BigDecimal price = new BigDecimal("10.00");

        assertFalse(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", UUID.randomUUID().toString(),
                3, 4, true, false, price
        ));

        assertFalse(reservationRepository.beginUpdate(
                item.getId(), "another-user", "ad-edit", UUID.randomUUID().toString(),
                2, 4, true, false, price
        ));

        assertEquals(2, reload().getCommittedQuantity());
        assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-edit").getStatus());
    }

    @Test
    void shouldBlockSecondEditAndCancellationWhileUpdateIsPending() {
        activate("ad-edit", 2);
        String operationId = UUID.randomUUID().toString();
        BigDecimal price = new BigDecimal("10.00");

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 3, true, false, price
        ));

        assertFalse(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", UUID.randomUUID().toString(),
                2, 4, true, false, price
        ));
        assertFalse(reservationRepository.beginCancellation(
                item.getId(), userId, "ad-edit"
        ));
        assertFalse(reservationRepository.release(
                item.getId(), userId, "ad-edit", 2,
                AdReservationStatus.ACTIVE
        ));

        assertEquals(3, reload().getCommittedQuantity());
        assertEquals(AdReservationStatus.PENDING_UPDATE, findReservation("ad-edit").getStatus());

        assertTrue(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 3, true, false, price
        ));
        assertEquals(3, reload().getCommittedQuantity());
    }

    @Test
    void shouldRejectWrongOperationIdWithoutChangingPendingReservation() {
        activate("ad-edit", 2);
        String operationId = UUID.randomUUID().toString();
        BigDecimal price = new BigDecimal("10.00");

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, false, price
        ));

        assertFalse(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", "wrong-operation",
                2, 4, true, false, price
        ));
        assertFalse(reservationRepository.abortUpdate(
                item.getId(), userId, "ad-edit", "wrong-operation", 2, 4
        ));

        assertEquals(4, reload().getCommittedQuantity());
        assertEquals(operationId, findReservation("ad-edit").getPendingOperationId());
        assertEquals(AdReservationStatus.PENDING_UPDATE, findReservation("ad-edit").getStatus());

        assertTrue(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 4, true, false, price
        ));
        assertEquals(4, reload().getCommittedQuantity());
    }

    @Test
    void shouldPreventUpdateWhileCancellationIsPending() {
        activate("ad-edit", 3);
        assertTrue(reservationRepository.beginCancellation(
                item.getId(), userId, "ad-edit"
        ));

        assertFalse(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", UUID.randomUUID().toString(),
                3, 4, true, false, new BigDecimal("10.00")
        ));

        assertEquals(3, reload().getCommittedQuantity());
        assertEquals(AdReservationStatus.PENDING_CANCELLATION, findReservation("ad-edit").getStatus());
    }

    @Test
    void shouldAllowPriceAndModalityUpdateWithoutChangingQuantity() {
        activate("ad-edit", 2);
        String operationId = UUID.randomUUID().toString();

        assertTrue(reservationRepository.beginUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 2, false, true, null
        ));

        assertEquals(2, reload().getCommittedQuantity());

        assertTrue(reservationRepository.confirmUpdate(
                item.getId(), userId, "ad-edit", operationId,
                2, 2, false, true, null
        ));

        AdReservation active = findReservation("ad-edit");
        assertEquals(AdReservationStatus.ACTIVE, active.getStatus());
        assertEquals(2, active.getQuantity());
        assertEquals(2, reload().getCommittedQuantity());
        assertFalse(active.isSaleEnabled());
        assertTrue(active.isTradeEnabled());
        assertNull(active.getUnitPrice());
    }

    @Test
    void shouldPreventTwoDifferentAdsFromIncreasingBeyondAvailability() throws Exception {
        activate("ad-first", 2);
        activate("ad-second", 2);

        CountDownLatch start = new CountDownLatch(1);
        BigDecimal price = new BigDecimal("10.00");
        String firstOperation = UUID.randomUUID().toString();
        String secondOperation = UUID.randomUUID().toString();

        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await();
                return reservationRepository.beginUpdate(
                        item.getId(), userId, "ad-first", firstOperation,
                        2, 3, true, false, price
                );
            });

            var second = executor.submit(() -> {
                start.await();
                return reservationRepository.beginUpdate(
                        item.getId(), userId, "ad-second", secondOperation,
                        2, 3, true, false, price
                );
            });

            start.countDown();

            boolean resultFirst = first.get(15, TimeUnit.SECONDS);
            boolean resultSecond = second.get(15, TimeUnit.SECONDS);

            assertNotEquals(resultFirst, resultSecond);
            assertEquals(5, reload().getCommittedQuantity());
            assertTrue(reload().getCommittedQuantity() <= reload().getQuantity());

            if (resultFirst) {
                assertEquals(AdReservationStatus.PENDING_UPDATE,
                        findReservation("ad-first").getStatus());
                assertEquals(AdReservationStatus.ACTIVE,
                        findReservation("ad-second").getStatus());
                assertTrue(reservationRepository.confirmUpdate(
                        item.getId(), userId, "ad-first", firstOperation,
                        2, 3, true, false, price
                ));
            } else {
                assertEquals(AdReservationStatus.ACTIVE,
                        findReservation("ad-first").getStatus());
                assertEquals(AdReservationStatus.PENDING_UPDATE,
                        findReservation("ad-second").getStatus());
                assertTrue(reservationRepository.confirmUpdate(
                        item.getId(), userId, "ad-second", secondOperation,
                        2, 3, true, false, price
                ));
            }

            assertEquals(5, reload().getCommittedQuantity());
            assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-first").getStatus());
            assertEquals(AdReservationStatus.ACTIVE, findReservation("ad-second").getStatus());
        }
    }

    @Test
    void shouldAllowOnlyOneConcurrentEditOfSameReservation() throws Exception {
        activate("ad-edit", 2);
        CountDownLatch start = new CountDownLatch(1);
        BigDecimal price = new BigDecimal("10.00");

        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await();
                return reservationRepository.beginUpdate(
                        item.getId(), userId, "ad-edit", UUID.randomUUID().toString(),
                        2, 3, true, false, price
                );
            });

            var second = executor.submit(() -> {
                start.await();
                return reservationRepository.beginUpdate(
                        item.getId(), userId, "ad-edit", UUID.randomUUID().toString(),
                        2, 4, true, false, price
                );
            });

            start.countDown();
            boolean resultFirst = first.get(15, TimeUnit.SECONDS);
            boolean resultSecond = second.get(15, TimeUnit.SECONDS);

            assertNotEquals(resultFirst, resultSecond);
            int expected = resultFirst ? 3 : 4;
            assertEquals(expected, reload().getCommittedQuantity());
            assertEquals(2, findReservation("ad-edit").getQuantity());
            assertEquals(expected, findReservation("ad-edit").getPendingQuantity());
            assertEquals(AdReservationStatus.PENDING_UPDATE,
                    findReservation("ad-edit").getStatus());
        }
    }
}
