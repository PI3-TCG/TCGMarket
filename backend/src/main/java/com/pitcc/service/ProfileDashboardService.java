package com.pitcc.service;

import com.pitcc.dto.*;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.*;
import com.pitcc.repository.UserRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ProfileDashboardService {
  private final MongoTemplate mongo;
  private final UserRepository users;
  private final CollectionService collection;

  public ProfileDashboardService(MongoTemplate mongo, UserRepository users, CollectionService collection) {
    this.mongo = mongo;
    this.users = users;
    this.collection = collection;
  }

  public record Activity(String id, String kind, String description, Instant occurredAt, String status) {}
  public record Dashboard(long totalGames, long totalCopies, long activeAds, long publishedAds,
      long completedTransactions, List<Activity> activities) {}
  public record PublicSummary(boolean collectionPublic, String avatarUrl, long completedTransactions) {}
  public record PublicCollectionItem(CollectionCardResponse card, int quantity) {}

  private User own(String id) {
    return users.findById(id).orElseThrow(InvalidAuthenticationException::new);
  }

  private User publicUser(String username) {
    return users.findByUsername(username.trim().toLowerCase(Locale.ROOT)).orElseThrow(UserNotFoundException::new);
  }

  public ProfileSettings settings(String id) {
    User user = own(id);
    return new ProfileSettings(user.isCollectionPublic(), user.getAvatarUrl());
  }

  public ProfileSettings updateSettings(String id, ProfileSettings settings) {
    own(id);
    validateAvatar(settings.avatarUrl());
    // Atualização parcial: não sobrescreve edições simultâneas dos demais dados da conta.
    mongo.updateFirst(Query.query(Criteria.where("id").is(id)), new Update()
        .set("collectionPublic", settings.collectionPublic()).set("avatarUrl", settings.avatarUrl()), User.class);
    return settings;
  }

  private void validateAvatar(String value) {
    if (value == null) return;
    try {
      int separator = value.indexOf(',');
      byte[] bytes = Base64.getDecoder().decode(value.substring(separator + 1));
      boolean png = value.startsWith("data:image/png;base64,") && bytes.length >= 8
          && Arrays.equals(Arrays.copyOf(bytes, 8), new byte[]{(byte)137, 80, 78, 71, 13, 10, 26, 10});
      boolean jpeg = value.startsWith("data:image/jpeg;base64,") && bytes.length >= 3
          && bytes[0] == (byte)255 && bytes[1] == (byte)216 && bytes[2] == (byte)255;
      boolean webp = value.startsWith("data:image/webp;base64,") && bytes.length >= 12
          && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
          && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
      if (bytes.length > 2 * 1024 * 1024 || !(png || jpeg || webp)) {
        throw new IllegalArgumentException("Envie uma imagem JPEG, PNG ou WebP de até 2 MB.");
      }
    } catch (IllegalArgumentException exception) {
      throw new IllegalArgumentException("Envie uma imagem JPEG, PNG ou WebP de até 2 MB.");
    }
  }

  private Criteria participant(String id) {
    return new Criteria().orOperator(Criteria.where("buyerId").is(id), Criteria.where("sellerId").is(id));
  }

  public PublicSummary publicSummary(String username) {
    User user = publicUser(username);
    return new PublicSummary(user.isCollectionPublic(), user.getAvatarUrl(),
        mongo.count(Query.query(participant(user.getId())), Transaction.class));
  }

  public Page<PublicCollectionItem> publicCollection(String username, int page, int size) {
    User user = publicUser(username);
    if (!user.isCollectionPublic()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Coleção privada.");
    // O DTO público omite IDs dos itens, condição, idioma e disponibilidade para anúncios.
    return collection.findOwnCollection(user.getId(), page, size)
        .map(item -> new PublicCollectionItem(item.card(), item.quantity()));
  }

  public Dashboard dashboard(String id) {
    own(id);
    var summary = collection.summarizeOwnCollection(id);
    Criteria published = Criteria.where("sellerId").is(id).and("creationAborted").ne(true);
    long publishedAds = mongo.count(Query.query(published), Ad.class);
    long activeAds = mongo.count(Query.query(Criteria.where("sellerId").is(id)
        .and("creationAborted").ne(true).and("status").is(AdStatus.ACTIVE)
        .and("remainingQuantity").gt(0)), Ad.class);
    List<Activity> activities = new ArrayList<>();
    mongo.find(Query.query(published).with(Sort.by(Sort.Direction.DESC, "updatedAt")).limit(10), Ad.class)
        .forEach(ad -> activities.add(new Activity(ad.getId(), "AD", "Anúncio atualizado",
            ad.getUpdatedAt() == null ? ad.getCreatedAt() : ad.getUpdatedAt(), ad.getStatus().name())));
    mongo.find(Query.query(participant(id)).with(Sort.by(Sort.Direction.DESC, "completedAt")).limit(10), Transaction.class)
        .forEach(t -> activities.add(new Activity(t.getId(), "TRANSACTION", "Transação concluída", t.getCompletedAt(), "COMPLETED")));
    Criteria proposals = new Criteria().orOperator(Criteria.where("proposerId").is(id), Criteria.where("recipientId").is(id));
    mongo.find(Query.query(proposals).with(Sort.by(Sort.Direction.DESC, "updatedAt")).limit(10), TradeProposal.class)
        .forEach(p -> activities.add(new Activity(p.getId(), "PROPOSAL",
            id.equals(p.getProposerId()) ? "Proposta enviada" : "Proposta recebida", p.getUpdatedAt(), p.getStatus().name())));
    return new Dashboard(summary.totalGames(), summary.totalCopies(), activeAds, publishedAds,
        mongo.count(Query.query(participant(id)), Transaction.class), activities.stream()
            .filter(a -> a.occurredAt() != null).sorted(Comparator.comparing(Activity::occurredAt).reversed()).limit(10).toList());
  }
}
