
package com.pitcc.service;

import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdAvailabilityServiceTest {

    @Mock
    private CollectionItemRepository collectionItemRepository;

    private AdAvailabilityService service;

    @BeforeEach
    void setUp() {
        service = new AdAvailabilityService(
                collectionItemRepository
        );
    }

    private static CollectionItem item(
            String id,
            int quantity,
            int committed
    ) {
        CollectionItem item = new CollectionItem(
                "u1",
                "card-" + id,
                quantity,
                CardCondition.NEAR_MINT,
                CardLanguage.ENGLISH
        );

        ReflectionTestUtils.setField(
                item,
                "id",
                id
        );

        ReflectionTestUtils.setField(
                item,
                "committedQuantity",
                committed
        );

        return item;
    }

    @Test
    void shouldCalculateAvailabilityCorrectly() {
        CollectionItem free = item("a", 3, 0);
        CollectionItem partial = item("b", 5, 2);
        CollectionItem full = item("c", 5, 5);

        when(
                collectionItemRepository.findAllById(
                        List.of("a", "b", "c")
                )
        ).thenReturn(
                List.of(free, partial, full)
        );

        Map<String, CollectionItemAvailabilityResponse> result =
                service.availabilityOf(
                        List.of(free, partial, full)
                );

        assertEquals(
                new CollectionItemAvailabilityResponse(3, 0, 3),
                result.get("a")
        );

        assertEquals(
                new CollectionItemAvailabilityResponse(5, 2, 3),
                result.get("b")
        );

        assertEquals(
                new CollectionItemAvailabilityResponse(5, 5, 0),
                result.get("c")
        );

        assertEquals(3, result.size());
    }

    @Test
    void shouldUsePersistedCommittedQuantity() {
        CollectionItem staleItem = item("a", 5, 0);
        CollectionItem currentItem = item("a", 5, 3);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(currentItem)
        );

        CollectionItemAvailabilityResponse result =
                service.availabilityOf(staleItem);

        assertEquals(5, result.totalQuantity());
        assertEquals(3, result.committedQuantity());
        assertEquals(2, result.availableQuantity());

        verify(collectionItemRepository).findAllById(
                List.of("a")
        );
    }

    @Test
    void shouldReloadCollectionInsteadOfUsingStaleQuantity() {
        CollectionItem staleItem = item("a", 5, 0);
        CollectionItem currentItem = item("a", 7, 3);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(currentItem)
        );

        CollectionItemAvailabilityResponse result =
                service.availabilityOf(staleItem);

        assertEquals(7, result.totalQuantity());
        assertEquals(3, result.committedQuantity());
        assertEquals(4, result.availableQuantity());
    }

    @Test
    void shouldReturnZeroAvailabilityWhenFullyCommitted() {
        CollectionItem fullItem = item("a", 5, 5);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(fullItem)
        );

        CollectionItemAvailabilityResponse result =
                service.availabilityOf(fullItem);

        assertEquals(5, result.totalQuantity());
        assertEquals(5, result.committedQuantity());
        assertEquals(0, result.availableQuantity());
    }

    @Test
    void shouldRejectMissingCommittedQuantity() {
        CollectionItem invalidItem = item("a", 5, 0);

        ReflectionTestUtils.setField(
                invalidItem,
                "committedQuantity",
                null
        );

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(invalidItem)
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.availabilityOf(invalidItem)
        );
    }

    @Test
    void shouldRejectCommittedQuantityAboveTotal() {
        CollectionItem invalidItem = item("a", 5, 6);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(invalidItem)
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.availabilityOf(invalidItem)
        );
    }

    @Test
    void shouldRejectNegativeCommittedQuantity() {
        CollectionItem invalidItem = item("a", 5, -1);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of(invalidItem)
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.availabilityOf(invalidItem)
        );
    }

    @Test
    void shouldRejectCollectionItemThatNoLongerExists() {
        CollectionItem deletedItem = item("a", 5, 0);

        when(
                collectionItemRepository.findAllById(
                        List.of("a")
                )
        ).thenReturn(
                List.of()
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.availabilityOf(deletedItem)
        );
    }

    @Test
    void shouldReturnEmptyMapForEmptyCollection() {
        Map<String, CollectionItemAvailabilityResponse> result =
                service.availabilityOf(List.of());

        assertTrue(result.isEmpty());

        verifyNoInteractions(collectionItemRepository);
    }
}
