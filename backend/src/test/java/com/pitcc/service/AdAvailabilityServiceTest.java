package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.pitcc.dto.CollectionItemAvailabilityResponse;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdCommitmentRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AdAvailabilityServiceTest {

  @Mock private AdCommitmentRepository adCommitmentRepository;

  private static CollectionItem item(String id, int quantity) {
    CollectionItem item =
        new CollectionItem("u1", "card-" + id, quantity, CardCondition.NEAR_MINT, CardLanguage.ENGLISH);
    ReflectionTestUtils.setField(item, "id", id);
    return item;
  }

  @Test
  void shouldSubtractActiveCommitmentsFromCollectionQuantity() {
    CollectionItem free = item("a", 3);
    CollectionItem partial = item("b", 5);
    CollectionItem full = item("c", 5);

    when(adCommitmentRepository.sumActiveRemainingByCollectionItem(List.of("a", "b", "c")))
        .thenReturn(Map.of("b", 2, "c", 5));

    Map<String, CollectionItemAvailabilityResponse> result =
        new AdAvailabilityService(adCommitmentRepository)
            .availabilityOf(List.of(free, partial, full));

    assertEquals(new CollectionItemAvailabilityResponse(3, 0, 3), result.get("a"));
    assertEquals(new CollectionItemAvailabilityResponse(5, 2, 3), result.get("b"));
    assertEquals(new CollectionItemAvailabilityResponse(5, 5, 0), result.get("c"));
  }

  @Test
  void shouldNeverReportNegativeAvailability() {
    CollectionItem reduced = item("a", 2);

    when(adCommitmentRepository.sumActiveRemainingByCollectionItem(List.of("a")))
        .thenReturn(Map.of("a", 3));

    assertEquals(
        new CollectionItemAvailabilityResponse(2, 3, 0),
        new AdAvailabilityService(adCommitmentRepository).availabilityOf(reduced));
  }
}
