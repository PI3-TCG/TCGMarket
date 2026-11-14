package com.pitcc.service;

import com.pitcc.dto.AdminActionResponse;
import com.pitcc.dto.AdminUserResponse;
import com.pitcc.dto.CatalogPageResponse;
import com.pitcc.exception.OwnRoleChangeException;
import com.pitcc.exception.OwnStatusChangeException;
import com.pitcc.exception.UserNotFoundException;
import com.pitcc.model.AdminAction;
import com.pitcc.model.AdminActionType;
import com.pitcc.model.ModeratedProfileField;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import com.pitcc.repository.AdminActionRepository;
import com.pitcc.repository.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

/**
 * O próprio administrador nunca altera papel nem situação da sua conta, então sempre resta ao
 * menos um administrador ativo: quem está agindo.
 */
@Service
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserService {

  static final int MAX_PAGE_SIZE = 20;
  static final int MAX_USER_ACTIONS = 50;
  static final int MAX_RECENT_ACTIONS = 20;

  private final UserRepository userRepository;
  private final AdminActionRepository adminActionRepository;
  private final MongoTemplate mongoTemplate;

  public AdminUserService(
      UserRepository userRepository,
      AdminActionRepository adminActionRepository,
      MongoTemplate mongoTemplate) {
    this.userRepository = userRepository;
    this.adminActionRepository = adminActionRepository;
    this.mongoTemplate = mongoTemplate;
  }

  public CatalogPageResponse<AdminUserResponse> searchUsers(
      String q, UserRole role, UserStatus status, Integer page, Integer size) {
    int number = page == null ? 0 : Math.max(page, 0);
    int pageSize = size == null ? MAX_PAGE_SIZE : Math.clamp(size, 1, MAX_PAGE_SIZE);

    Criteria criteria = new Criteria();
    List<Criteria> filters = new ArrayList<>();
    if (q != null && !q.isBlank()) {
      Pattern term = Pattern.compile(Pattern.quote(q.trim()), Pattern.CASE_INSENSITIVE);
      filters.add(new Criteria().orOperator(
          Criteria.where("name").regex(term),
          Criteria.where("username").regex(term),
          Criteria.where("email").regex(term)));
    }
    if (role != null) {
      filters.add(Criteria.where("role").is(role));
    }
    if (status == UserStatus.SUSPENDED) {
      filters.add(Criteria.where("status").is(UserStatus.SUSPENDED));
    } else if (status == UserStatus.ACTIVE) {
      filters.add(Criteria.where("status").ne(UserStatus.SUSPENDED));
    }
    if (!filters.isEmpty()) {
      criteria.andOperator(filters);
    }

    Query query = new Query(criteria);
    long total = mongoTemplate.count(query, User.class);
    List<User> found = total == 0
        ? List.of()
        : mongoTemplate.find(
            query.with(PageRequest.of(number, pageSize, Sort.by("name", "email"))), User.class);
    return CatalogPageResponse.of(
        found.stream().map(AdminUserResponse::from).toList(), number, pageSize, total);
  }

  public AdminUserResponse getUser(String userId) {
    return AdminUserResponse.from(find(userId));
  }

  public AdminUserResponse changeRole(String actorId, String userId, UserRole role) {
    if (actorId.equals(userId)) {
      throw new OwnRoleChangeException();
    }
    User user = find(userId);
    if (user.getRole() == role) {
      return AdminUserResponse.from(user);
    }
    user.setRole(role);
    User saved = userRepository.save(user);

    AdminAction action = action(actorId, userId, AdminActionType.ROLE_CHANGED, null);
    action.setRole(role);
    adminActionRepository.save(action);
    return AdminUserResponse.from(saved);
  }

  public AdminUserResponse changeStatus(
      String actorId, String userId, UserStatus status, String reason) {
    if (actorId.equals(userId)) {
      throw new OwnStatusChangeException();
    }
    User user = find(userId);
    if (user.getStatus() == status) {
      return AdminUserResponse.from(user);
    }
    user.setStatus(status);
    User saved = userRepository.save(user);

    AdminActionType type = status == UserStatus.SUSPENDED
        ? AdminActionType.ACCOUNT_SUSPENDED
        : AdminActionType.ACCOUNT_REACTIVATED;
    adminActionRepository.save(action(actorId, userId, type, reason));
    return AdminUserResponse.from(saved);
  }

  public AdminUserResponse moderateProfile(
      String actorId, String userId, List<ModeratedProfileField> fields, String reason) {
    User user = find(userId);
    for (ModeratedProfileField field : fields) {
      switch (field) {
        case BIO -> user.setBio(null);
        case LINKS -> user.setLinks(List.of());
        case LOCATION -> {
          user.setCity(null);
          user.setState(null);
        }
      }
    }
    User saved = userRepository.save(user);

    AdminAction action = action(actorId, userId, AdminActionType.PROFILE_MODERATED, reason);
    action.setFields(List.copyOf(fields));
    adminActionRepository.save(action);
    return AdminUserResponse.from(saved);
  }

  public List<AdminActionResponse> userActions(String userId) {
    find(userId);
    return withParticipants(adminActionRepository.findByTargetIdOrderByCreatedAtDesc(
        userId, PageRequest.of(0, MAX_USER_ACTIONS)));
  }

  public List<AdminActionResponse> recentActions(Integer limit) {
    int size = limit == null ? 6 : Math.clamp(limit, 1, MAX_RECENT_ACTIONS);
    return withParticipants(
        adminActionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, size)));
  }

  private User find(String userId) {
    return userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
  }

  private List<AdminActionResponse> withParticipants(List<AdminAction> actions) {
    Set<String> ids = new HashSet<>();
    actions.forEach(action -> {
      ids.add(action.getActorId());
      ids.add(action.getTargetId());
    });
    Map<String, User> users = userRepository.findAllById(ids).stream()
        .collect(Collectors.toMap(User::getId, Function.identity()));
    return actions.stream()
        .map(action -> AdminActionResponse.from(
            action, users.get(action.getActorId()), users.get(action.getTargetId())))
        .toList();
  }

  private static AdminAction action(
      String actorId, String targetId, AdminActionType type, String reason) {
    AdminAction action = new AdminAction();
    action.setActorId(actorId);
    action.setTargetId(targetId);
    action.setType(type);
    action.setReason(reason);
    action.setCreatedAt(Instant.now());
    return action;
  }
}
