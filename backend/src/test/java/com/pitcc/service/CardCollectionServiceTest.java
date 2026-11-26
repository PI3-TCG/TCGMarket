package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pitcc.exception.CollectionDeleteBlockedException;
import com.pitcc.exception.CollectionNotFoundException;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCollection;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardCollectionRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CardCollectionServiceTest {

  @Mock private CardCollectionRepository collectionRepository;
  @Mock private CollectionItemRepository itemRepository;
  @Mock private CardRepository cardRepository;
  @Mock private AdRepository adRepository;

  private CardCollectionService service;

  @BeforeEach
  void setUp() {
    service = new CardCollectionService(collectionRepository, itemRepository, cardRepository, adRepository);
    lenient().when(itemRepository.findByCollectionId(any())).thenReturn(List.of());
  }

  @Test
  void createsCollection() {
    when(collectionRepository.existsByUserIdAndNameIgnoreCase("user", "Trocas")).thenReturn(false);
    when(collectionRepository.save(any())).thenAnswer(invocation -> {
      CardCollection collection = invocation.getArgument(0);
      ReflectionTestUtils.setField(collection, "id", "col-1");
      return collection;
    });

    assertEquals("Trocas", service.create("user", "  Trocas  ").name());
  }

  @Test
  void rejectsDuplicateName() {
    when(collectionRepository.existsByUserIdAndNameIgnoreCase("user", "Trocas")).thenReturn(true);

    assertThrows(IllegalArgumentException.class, () -> service.create("user", "Trocas"));
    verify(collectionRepository, never()).save(any());
  }

  @Test
  void hidesAnotherUsersCollection() {
    when(collectionRepository.findByIdAndUserId("col-1", "user")).thenReturn(Optional.empty());

    assertThrows(CollectionNotFoundException.class, () -> service.rename("user", "col-1", "Nova"));
  }

  @Test
  void blocksDeleteWhenACardIsInAnActiveAd() {
    CardCollection collection = owned("col-1");
    CollectionItem item = new CollectionItem(
            "user", "card", 1, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-1");
    ReflectionTestUtils.setField(item, "committedQuantity", 1);
    when(collectionRepository.findByIdAndUserId("col-1", "user")).thenReturn(Optional.of(collection));
    when(itemRepository.findByCollectionId("col-1")).thenReturn(List.of(item));
    when(adRepository.existsByCollectionItemIdInAndStatus(List.of("item-1"), AdStatus.ACTIVE))
            .thenReturn(true);

    assertThrows(CollectionDeleteBlockedException.class, () -> service.delete("user", "col-1"));
    verify(collectionRepository, never()).delete(any());
  }

  @Test
  void deletesCollectionAndItsItems() {
    CardCollection collection = owned("col-1");
    CollectionItem item = new CollectionItem(
            "user", "card", 1, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    ReflectionTestUtils.setField(item, "id", "item-1");
    when(collectionRepository.findByIdAndUserId("col-1", "user")).thenReturn(Optional.of(collection));
    when(itemRepository.findByCollectionId("col-1")).thenReturn(List.of(item));
    when(adRepository.existsByCollectionItemIdInAndStatus(List.of("item-1"), AdStatus.ACTIVE))
            .thenReturn(false);

    service.delete("user", "col-1");

    verify(itemRepository).deleteByCollectionId("col-1");
    verify(collectionRepository).delete(collection);
  }

  private static CardCollection owned(String id) {
    CardCollection collection = new CardCollection("user", "Minha coleção", Instant.now());
    ReflectionTestUtils.setField(collection, "id", id);
    return collection;
  }
}
