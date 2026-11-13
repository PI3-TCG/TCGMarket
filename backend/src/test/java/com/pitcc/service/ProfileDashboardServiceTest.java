package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.pitcc.dto.*;
import com.pitcc.model.*;
import com.pitcc.repository.UserRepository;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProfileDashboardServiceTest {
  @Mock MongoTemplate mongo;
  @Mock UserRepository users;
  @Mock CollectionService collection;
  @InjectMocks ProfileDashboardService service;

  User user() {
    User user = new User(); user.setId("owner"); user.setUsername("collector"); return user;
  }
  @Test void oldAccountsArePrivateAndCannotLeakCards() {
    when(users.findByUsername("collector")).thenReturn(Optional.of(user()));
    var exception = assertThrows(ResponseStatusException.class, () -> service.publicCollection("Collector", 0, 20));
    assertEquals(404, exception.getStatusCode().value());
    verifyNoInteractions(collection, mongo);
  }
  @Test void publicCollectionOmitsManagementAndPrivateFields() {
    User user = user(); user.setCollectionPublic(true);
    when(users.findByUsername("collector")).thenReturn(Optional.of(user));
    var card = new CollectionCardResponse("catalog-card", "Pikachu", CardGame.POKEMON, "Base", "1", "Rare", "image");
    when(collection.findOwnCollection("owner", 0, 20)).thenReturn(new PageImpl<>(List.of(
        new CollectionItemResponse("private-item", 3, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, card, null))));
    var result = service.publicCollection("collector", 0, 20).getContent().getFirst();
    assertEquals(card, result.card()); assertEquals(3, result.quantity());
    assertEquals(List.of("card", "quantity"), Arrays.stream(result.getClass().getRecordComponents()).map(c -> c.getName()).toList());
  }
  @Test void privacyChangesOnlySettingsOfAuthenticatedAccount() {
    when(users.findById("owner")).thenReturn(Optional.of(user()));
    var value = new ProfileSettings(true, null);
    assertEquals(value, service.updateSettings("owner", value));
    var query = ArgumentCaptor.forClass(Query.class); var update = ArgumentCaptor.forClass(Update.class);
    verify(mongo).updateFirst(query.capture(), update.capture(), eq(User.class));
    assertEquals("owner", query.getValue().getQueryObject().getString("id"));
    var fields = (org.bson.Document) update.getValue().getUpdateObject().get("$set");
    assertEquals(Set.of("collectionPublic", "avatarUrl"), fields.keySet());
    assertEquals(true, fields.getBoolean("collectionPublic"));
    verify(users, never()).save(any()); verifyNoInteractions(collection);
  }
  @Test void rejectsFakeImagesAndFilesOverTwoMegabytesBeforePersisting() {
    when(users.findById("owner")).thenReturn(Optional.of(user()));
    assertThrows(IllegalArgumentException.class,
        () -> service.updateSettings("owner", new ProfileSettings(false, "data:image/png;base64,YWJj")));
    byte[] bytes = new byte[2 * 1024 * 1024 + 1];
    bytes[0] = (byte)255; bytes[1] = (byte)216; bytes[2] = (byte)255;
    assertThrows(IllegalArgumentException.class,
        () -> service.updateSettings("owner", new ProfileSettings(false, "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bytes))));
    verifyNoInteractions(mongo);
  }

  @Test void dashboardUsesPersistedCountsAndExcludesAbortedAds() {
    when(users.findById("owner")).thenReturn(Optional.of(user()));
    when(collection.summarizeOwnCollection("owner")).thenReturn(new CollectionSummaryResponse(4, 17, 2));
    when(mongo.count(any(Query.class), eq(Ad.class))).thenReturn(8L, 3L);
    when(mongo.count(any(Query.class), eq(Transaction.class))).thenReturn(5L);
    when(mongo.find(any(Query.class), eq(Ad.class))).thenReturn(List.of());
    when(mongo.find(any(Query.class), eq(Transaction.class))).thenReturn(List.of());
    when(mongo.find(any(Query.class), eq(TradeProposal.class))).thenReturn(List.of());
    var result = service.dashboard("owner");
    assertEquals(17, result.totalCopies()); assertEquals(2, result.totalGames());
    assertEquals(8, result.publishedAds()); assertEquals(3, result.activeAds());
    assertEquals(5, result.completedTransactions()); assertTrue(result.activities().isEmpty());
    var queries = ArgumentCaptor.forClass(Query.class);
    verify(mongo, times(2)).count(queries.capture(), eq(Ad.class));
    for (var query : queries.getAllValues()) {
      assertEquals("owner", query.getQueryObject().getString("sellerId"));
      assertEquals(new org.bson.Document("$ne", true), query.getQueryObject().get("creationAborted"));
    }
    assertEquals(AdStatus.ACTIVE, queries.getAllValues().get(1).getQueryObject().get("status"));
    assertEquals(new org.bson.Document("$gt", 0), queries.getAllValues().get(1).getQueryObject().get("remainingQuantity"));
  }
}
