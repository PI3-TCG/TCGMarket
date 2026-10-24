
package com.pitcc.service;

import com.mongodb.client.result.DeleteResult;
import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;

import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RemoveCollectionItemServiceTest {

  @Mock
  private CollectionItemRepository collectionItemRepository;

  @Mock
  private MongoTemplate mongoTemplate;

  private RemoveCollectionItemService service;
  private CollectionItem item;

  @BeforeEach
  void setUp() {
    service = new RemoveCollectionItemService(
            collectionItemRepository,
            mongoTemplate
    );

    item = new CollectionItem(
            "u1",
            "card-1",
            3,
            CardCondition.NEAR_MINT,
            CardLanguage.ENGLISH
    );

    ReflectionTestUtils.setField(
            item,
            "id",
            "item-1"
    );
  }

  @Test
  void shouldRemoveOnlyTheOwnersCollectionItem() {
    when(
            collectionItemRepository.findByIdAndUserId(
                    "item-1",
                    "u1"
            )
    ).thenReturn(Optional.of(item));

    when(
            mongoTemplate.remove(
                    any(Query.class),
                    eq(CollectionItem.class)
            )
    ).thenReturn(DeleteResult.acknowledged(1));

    service.removeCollectionItem("u1", "item-1");

    ArgumentCaptor<Query> queryCaptor =
            ArgumentCaptor.forClass(Query.class);

    verify(mongoTemplate).remove(
            queryCaptor.capture(),
            eq(CollectionItem.class)
    );

    Document query = queryCaptor.getValue().getQueryObject();

    assertEquals("item-1", query.get("_id"));
    assertEquals("u1", query.get("userId"));
    assertEquals(0, query.get("committedQuantity"));

    Document reservationCondition =
            query.get("adReservations.status", Document.class);

    assertNotNull(reservationCondition);
    assertTrue(reservationCondition.containsKey("$nin"));

    verify(collectionItemRepository)
            .findByIdAndUserId("item-1", "u1");

    verifyNoMoreInteractions(
            collectionItemRepository,
            mongoTemplate
    );
  }

  @Test
  void shouldNotRemoveItemOfAnotherUser() {
    when(
            collectionItemRepository.findByIdAndUserId(
                    "item-1",
                    "u2"
            )
    ).thenReturn(Optional.empty());

    assertThrows(
            CollectionItemNotFoundException.class,
            () -> service.removeCollectionItem("u2", "item-1")
    );

    verifyNoInteractions(mongoTemplate);
  }

  @Test
  void shouldNotRemoveItemWithCommittedQuantity() {
    ReflectionTestUtils.setField(
            item,
            "committedQuantity",
            2
    );

    when(
            collectionItemRepository.findByIdAndUserId(
                    "item-1",
                    "u1"
            )
    ).thenReturn(Optional.of(item));

    when(
            mongoTemplate.remove(
                    any(Query.class),
                    eq(CollectionItem.class)
            )
    ).thenReturn(DeleteResult.acknowledged(0));

    assertThrows(
            CollectionItemInActiveAdException.class,
            () -> service.removeCollectionItem("u1", "item-1")
    );

    verify(mongoTemplate).remove(
            any(Query.class),
            eq(CollectionItem.class)
    );
  }

  @Test
  void shouldReportConflictWhenReservationIsCreatedConcurrently() {
    CollectionItem updated = new CollectionItem(
            "u1",
            "card-1",
            3,
            CardCondition.NEAR_MINT,
            CardLanguage.ENGLISH
    );

    ReflectionTestUtils.setField(
            updated,
            "id",
            "item-1"
    );

    ReflectionTestUtils.setField(
            updated,
            "committedQuantity",
            2
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
            mongoTemplate.remove(
                    any(Query.class),
                    eq(CollectionItem.class)
            )
    ).thenReturn(DeleteResult.acknowledged(0));

    assertThrows(
            CollectionItemInActiveAdException.class,
            () -> service.removeCollectionItem("u1", "item-1")
    );

    verify(collectionItemRepository, times(2))
            .findByIdAndUserId("item-1", "u1");
  }

  @Test
  void shouldReportNotFoundWhenItemWasRemovedConcurrently() {
    when(
            collectionItemRepository.findByIdAndUserId(
                    "item-1",
                    "u1"
            )
    ).thenReturn(
            Optional.of(item),
            Optional.empty()
    );

    when(
            mongoTemplate.remove(
                    any(Query.class),
                    eq(CollectionItem.class)
            )
    ).thenReturn(DeleteResult.acknowledged(0));

    assertThrows(
            CollectionItemNotFoundException.class,
            () -> service.removeCollectionItem("u1", "item-1")
    );
  }

  @Test
  void shouldRejectItemWithoutInitializedCommittedQuantity() {
    ReflectionTestUtils.setField(
            item,
            "committedQuantity",
            null
    );

    when(
            collectionItemRepository.findByIdAndUserId(
                    "item-1",
                    "u1"
            )
    ).thenReturn(Optional.of(item));

    assertThrows(
            IllegalStateException.class,
            () -> service.removeCollectionItem("u1", "item-1")
    );

    verifyNoInteractions(mongoTemplate);
  }

  @Test
  void shouldRequireAuthenticatedUser() {
    assertThrows(
            InvalidAuthenticationException.class,
            () -> service.removeCollectionItem(" ", "item-1")
    );

    verifyNoInteractions(
            collectionItemRepository,
            mongoTemplate
    );
  }
}
