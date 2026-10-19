package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RemoveCollectionItemServiceTest {

  @Mock private CollectionItemRepository collectionItemRepository;
  @Mock private ActiveAdLookup activeAdLookup;

  private RemoveCollectionItemService service;
  private CollectionItem item;

  @BeforeEach
  void setUp() {
    service = new RemoveCollectionItemService(collectionItemRepository, activeAdLookup);
    item = new CollectionItem("u1", "card-1", 3, CardCondition.NEAR_MINT, CardLanguage.ENGLISH);
    ReflectionTestUtils.setField(item, "id", "item-1");
  }

  @Test
  void shouldRemoveOnlyTheOwnersCollectionItem() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));
    when(activeAdLookup.hasActiveAdFor("item-1")).thenReturn(false);
    when(collectionItemRepository.deleteByIdAndUserId("item-1", "u1")).thenReturn(1L);

    service.removeCollectionItem("u1", "item-1");

    verify(collectionItemRepository).findByIdAndUserId("item-1", "u1");
    verify(collectionItemRepository).deleteByIdAndUserId("item-1", "u1");
    verifyNoMoreInteractions(collectionItemRepository);
  }

  @Test
  void shouldNotRemoveItemOfAnotherUser() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u2")).thenReturn(Optional.empty());

    assertThrows(
        CollectionItemNotFoundException.class, () -> service.removeCollectionItem("u2", "item-1"));

    verify(collectionItemRepository, never()).deleteByIdAndUserId(anyString(), anyString());
    verify(collectionItemRepository, never()).deleteById(any());
    verifyNoInteractions(activeAdLookup);
  }

  @Test
  void shouldNotRemoveItemInActiveAd() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));
    when(activeAdLookup.hasActiveAdFor("item-1")).thenReturn(true);

    assertThrows(
        CollectionItemInActiveAdException.class,
        () -> service.removeCollectionItem("u1", "item-1"));

    verify(collectionItemRepository, never()).deleteByIdAndUserId(anyString(), anyString());
  }

  @Test
  void shouldReportNotFoundWhenItemWasRemovedConcurrently() {
    when(collectionItemRepository.findByIdAndUserId("item-1", "u1")).thenReturn(Optional.of(item));
    when(activeAdLookup.hasActiveAdFor("item-1")).thenReturn(false);
    when(collectionItemRepository.deleteByIdAndUserId("item-1", "u1")).thenReturn(0L);

    assertThrows(
        CollectionItemNotFoundException.class, () -> service.removeCollectionItem("u1", "item-1"));
  }

  @Test
  void shouldRequireAuthenticatedUser() {
    assertThrows(
        InvalidAuthenticationException.class, () -> service.removeCollectionItem(" ", "item-1"));

    verifyNoInteractions(collectionItemRepository, activeAdLookup);
  }
}
