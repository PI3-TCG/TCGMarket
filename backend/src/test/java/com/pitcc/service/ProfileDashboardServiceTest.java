package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.pitcc.dto.*;
import com.pitcc.integration.r2.AvatarStorage;
import com.pitcc.model.*;
import com.pitcc.repository.CardCollectionRepository;
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
  @Mock CardCollectionRepository cardCollections;
  @Mock CardCollectionService cardCollectionService;
  @Mock AvatarStorage avatars;
  @InjectMocks ProfileDashboardService service;

  private static final CollectionFilters FILTERS = new CollectionFilters("Pikachu", CardGame.POKEMON, "Base", "Rare", null, null);

  User user() {
    User user = new User(); user.setId("owner"); user.setUsername("collector"); return user;
  }
  @Test void oldAccountsArePrivateAndCannotLeakCards() {
    when(users.findByUsername("collector")).thenReturn(Optional.of(user()));
    var exception = assertThrows(ResponseStatusException.class, () -> service.publicCollection("Collector", 0, 20, FILTERS));
    assertEquals(404, exception.getStatusCode().value());
    verifyNoInteractions(collection, mongo);
  }
  @Test void publicCollectionOmitsManagementAndPrivateFields() {
    User user = user(); user.setCollectionPublic(true);
    when(users.findByUsername("collector")).thenReturn(Optional.of(user));
    var card = new CollectionCardResponse("catalog-card", "Pikachu", CardGame.POKEMON, "Base", "1", "Rare", "image");
    when(collection.findOwnCollection("owner", 0, 20, FILTERS)).thenReturn(new PageImpl<>(List.of(
        new CollectionItemResponse("private-item", 3, CardCondition.NEAR_MINT, CardLanguage.ENGLISH, card, null))));
    var result = service.publicCollection("collector", 0, 20, FILTERS).getContent().getFirst();
    assertEquals(card, result.card()); assertEquals(3, result.quantity());
    assertEquals(List.of("card", "quantity"), Arrays.stream(result.getClass().getRecordComponents()).map(c -> c.getName()).toList());
  }
  @Test void privateCollectionFilterOptionsAreHidden() {
    when(users.findByUsername("collector")).thenReturn(Optional.of(user()));
    var exception = assertThrows(ResponseStatusException.class,
        () -> service.publicCollectionFilterOptions("collector"));
    assertEquals(404, exception.getStatusCode().value());
    verifyNoInteractions(collection);
  }

  @Test void publicSummaryHidesGamesWhenCollectionIsPrivate() {
    when(users.findByUsername("collector")).thenReturn(Optional.of(user()));
    when(cardCollections.findByUserIdAndVisibleTrueOrderByCreatedAtAsc("owner")).thenReturn(List.of());

    assertTrue(service.publicSummary("collector").collectionGames().isEmpty());
    verifyNoInteractions(collection);
  }

  @Test void publicSummaryUsesGamesFromThePublicCollection() {
    User user = user();
    user.setCollectionPublic(true);
    CardCollection visible = new CardCollection("owner", "Minha coleção", true, java.time.Instant.now());
    org.springframework.test.util.ReflectionTestUtils.setField(visible, "id", "col-1");
    when(users.findByUsername("collector")).thenReturn(Optional.of(user));
    when(cardCollections.findByUserIdAndVisibleTrueOrderByCreatedAtAsc("owner")).thenReturn(List.of(visible));
    var games = List.of(CardGame.POKEMON, CardGame.YUGIOH);
    when(collection.summarizeOwnCollection("owner", "col-1"))
        .thenReturn(new CollectionSummaryResponse(4, 17, 2, games));

    assertEquals(games, service.publicSummary("collector").collectionGames());
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

  @Test void echoedAvatarUrlDoesNotReplaceStoredKey() {
    User user = user();
    user.setAvatarUrl("avatars/owner/photo.jpg");
    when(users.findById("owner")).thenReturn(Optional.of(user));
    when(avatars.readUrl("avatars/owner/photo.jpg")).thenReturn("https://signed.example/photo.jpg");
    var result = service.updateSettings("owner", new ProfileSettings(true, "https://signed.example/photo.jpg"));
    assertEquals("https://signed.example/photo.jpg", result.avatarUrl());
    var update = ArgumentCaptor.forClass(Update.class);
    verify(mongo).updateFirst(any(), update.capture(), eq(User.class));
    var fields = (org.bson.Document) update.getValue().getUpdateObject().get("$set");
    assertEquals(Set.of("collectionPublic"), fields.keySet());
    verify(avatars, never()).delete(any());
  }

  @Test void confirmStoresKeyAndRemovesPreviousObject() {
    User user = user();
    user.setCollectionPublic(true);
    user.setAvatarUrl("avatars/owner/old.jpg");
    when(users.findById("owner")).thenReturn(Optional.of(user));
    when(avatars.readUrl("avatars/owner/new.jpg")).thenReturn("https://signed.example/new.jpg");
    var result = service.confirmAvatar("owner", "avatars/owner/new.jpg");
    assertEquals("https://signed.example/new.jpg", result.avatarUrl());
    assertTrue(result.collectionPublic());
    verify(avatars).verify("owner", "avatars/owner/new.jpg");
    verify(avatars).delete("avatars/owner/old.jpg");
    var update = ArgumentCaptor.forClass(Update.class);
    verify(mongo).updateFirst(any(), update.capture(), eq(User.class));
    var fields = (org.bson.Document) update.getValue().getUpdateObject().get("$set");
    assertEquals("avatars/owner/new.jpg", fields.getString("avatarUrl"));
    assertNull(fields.get("collectionPublic"));
  }

  @Test void confirmRejectsForeignKeyBeforePersisting() {
    when(users.findById("owner")).thenReturn(Optional.of(user()));
    assertThrows(IllegalArgumentException.class, () -> service.confirmAvatar("owner", "avatars/other/photo.jpg"));
    verifyNoInteractions(mongo, avatars);
  }

  @Test void dashboardUsesPersistedCountsAndExcludesAbortedAds() {
    when(users.findById("owner")).thenReturn(Optional.of(user()));
    when(collection.summarizeOwnCollection("owner")).thenReturn(new CollectionSummaryResponse(4, 17, 2, List.of(CardGame.POKEMON, CardGame.YUGIOH)));
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
