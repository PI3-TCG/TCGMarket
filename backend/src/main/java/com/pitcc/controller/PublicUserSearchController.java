package com.pitcc.controller;

import com.pitcc.integration.r2.AvatarStorage;
import com.pitcc.model.CardGame;
import com.pitcc.model.User;
import com.pitcc.model.UserStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicUserSearchController {
  private static final int PAGE_SIZE = 12;
  private final MongoTemplate mongo;
  private final AvatarStorage avatars;

  public PublicUserSearchController(MongoTemplate mongo, AvatarStorage avatars) {
    this.mongo = mongo;
    this.avatars = avatars;
  }

  public record PublicUser(
      String name,
      String username,
      String avatarUrl,
      String city,
      String state,
      List<CardGame> favoriteGames
  ) {}
  public record Results(List<PublicUser> users, boolean hasMore) {}

  @GetMapping("/api/users/search")
  public Results search(@RequestParam @NotBlank @Size(max = 100) String q,
      @RequestParam(defaultValue = "1") @Min(1) @Max(1000000) int page) {
    String term = q.strip();
    boolean byHandle = term.startsWith("@");
    if (byHandle) term = term.substring(1).strip();
    if (term.isEmpty()) return new Results(List.of(), false);

    Pattern literal = Pattern.compile(Pattern.quote(term), Pattern.CASE_INSENSITIVE);
    Criteria username = Criteria.where("username").regex(literal);
    Criteria match = byHandle ? username : new Criteria().orOperator(username, Criteria.where("name").regex(literal));
    Query query = Query.query(new Criteria().andOperator(match,
        Criteria.where("status").ne(UserStatus.SUSPENDED),
        Criteria.where("username").regex("\\S")));
    query.fields().include("name").include("username").include("avatarUrl")
        .include("city").include("state").include("favoriteGames").exclude("_id");
    query.with(Sort.by("username")).skip((page - 1L) * PAGE_SIZE).limit(PAGE_SIZE + 1);
    var users = mongo.find(query, User.class);
    return new Results(users.stream().limit(PAGE_SIZE).map(this::toPublicUser).toList(), users.size() > PAGE_SIZE);
  }

  private PublicUser toPublicUser(User user) {
    List<CardGame> games = user.getFavoriteGames() == null ? List.of() : user.getFavoriteGames();
    return new PublicUser(
        user.getName(),
        user.getUsername(),
        avatar(user.getAvatarUrl()),
        blankToNull(user.getCity()),
        blankToNull(user.getState()),
        games
    );
  }

  private String avatar(String stored) {
    if (stored == null || stored.isBlank()) return null;
    return stored.startsWith("avatars/") ? avatars.readUrl(stored) : stored;
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.strip();
  }
}
