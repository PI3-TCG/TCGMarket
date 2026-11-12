package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private AdminActionRepository adminActionRepository;

  @Mock private MongoTemplate mongoTemplate;

  private AdminUserService adminUserService;

  @BeforeEach
  void setUp() {
    adminUserService = new AdminUserService(userRepository, adminActionRepository, mongoTemplate);
  }

  @Test
  void shouldSearchUsersWithFiltersAndCapThePageSize() {
    when(mongoTemplate.count(any(Query.class), eq(User.class))).thenReturn(1L);
    when(mongoTemplate.find(any(Query.class), eq(User.class)))
        .thenReturn(List.of(user("user1", UserRole.USER)));

    CatalogPageResponse<AdminUserResponse> page =
        adminUserService.searchUsers("ana.(", UserRole.USER, UserStatus.ACTIVE, 0, 500);

    assertEquals(1, page.totalElements());
    assertEquals(AdminUserService.MAX_PAGE_SIZE, page.size());
    assertEquals(UserStatus.ACTIVE, page.content().get(0).status());

    ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
    verify(mongoTemplate).find(query.capture(), eq(User.class));
    String filter = query.getValue().getQueryObject().toString();
    assertTrue(filter.contains("\\Qana.(\\E"), filter);
    assertTrue(filter.contains("role=USER"), filter);
    assertTrue(filter.contains("$ne=SUSPENDED"), filter);
    assertEquals(AdminUserService.MAX_PAGE_SIZE, query.getValue().getLimit());
  }

  @Test
  void shouldNotQueryTheUsersWhenNothingMatches() {
    when(mongoTemplate.count(any(Query.class), eq(User.class))).thenReturn(0L);

    CatalogPageResponse<AdminUserResponse> page =
        adminUserService.searchUsers(null, null, UserStatus.SUSPENDED, null, null);

    assertEquals(0, page.totalElements());
    verify(mongoTemplate, never()).find(any(Query.class), eq(User.class));
  }

  @Test
  void shouldPromoteAnotherUserAndRecordTheAction() {
    User target = user("user1", UserRole.USER);
    when(userRepository.findById("user1")).thenReturn(Optional.of(target));
    when(userRepository.save(target)).thenReturn(target);

    AdminUserResponse response = adminUserService.changeRole("admin1", "user1", UserRole.ADMIN);

    assertEquals(UserRole.ADMIN, response.role());
    AdminAction action = savedAction();
    assertEquals(AdminActionType.ROLE_CHANGED, action.getType());
    assertEquals(UserRole.ADMIN, action.getRole());
    assertEquals("admin1", action.getActorId());
    assertEquals("user1", action.getTargetId());
  }

  @Test
  void shouldNotChangeTheOwnRole() {
    assertThrows(
        OwnRoleChangeException.class,
        () -> adminUserService.changeRole("admin1", "admin1", UserRole.USER));

    verify(userRepository, never()).save(any());
    verify(adminActionRepository, never()).save(any());
  }

  @Test
  void shouldFailWhenTheUserDoesNotExist() {
    when(userRepository.findById("missing")).thenReturn(Optional.empty());

    assertThrows(
        UserNotFoundException.class,
        () -> adminUserService.changeRole("admin1", "missing", UserRole.ADMIN));
  }

  @Test
  void shouldNotSaveWhenTheRoleIsAlreadyTheSame() {
    when(userRepository.findById("user1")).thenReturn(Optional.of(user("user1", UserRole.USER)));

    adminUserService.changeRole("admin1", "user1", UserRole.USER);

    verify(userRepository, never()).save(any());
    verify(adminActionRepository, never()).save(any());
  }

  @Test
  void shouldSuspendAnotherAccountWithTheReason() {
    User target = user("admin2", UserRole.ADMIN);
    when(userRepository.findById("admin2")).thenReturn(Optional.of(target));
    when(userRepository.save(target)).thenReturn(target);

    AdminUserResponse response = adminUserService.changeStatus(
        "admin1", "admin2", UserStatus.SUSPENDED, "Conteúdo ofensivo no nome");

    assertEquals(UserStatus.SUSPENDED, response.status());
    assertTrue(target.isSuspended());
    AdminAction action = savedAction();
    assertEquals(AdminActionType.ACCOUNT_SUSPENDED, action.getType());
    assertEquals("Conteúdo ofensivo no nome", action.getReason());
  }

  @Test
  void shouldReactivateASuspendedAccount() {
    User target = user("user1", UserRole.USER);
    target.setStatus(UserStatus.SUSPENDED);
    when(userRepository.findById("user1")).thenReturn(Optional.of(target));
    when(userRepository.save(target)).thenReturn(target);

    adminUserService.changeStatus("admin1", "user1", UserStatus.ACTIVE, "Recurso aceito pela equipe");

    assertEquals(UserStatus.ACTIVE, target.getStatus());
    assertEquals(AdminActionType.ACCOUNT_REACTIVATED, savedAction().getType());
  }

  @Test
  void shouldNotSuspendTheOwnAccount() {
    assertThrows(
        OwnStatusChangeException.class,
        () -> adminUserService.changeStatus(
            "admin1", "admin1", UserStatus.SUSPENDED, "Motivo qualquer aqui"));

    verify(userRepository, never()).save(any());
    verify(adminActionRepository, never()).save(any());
  }

  @Test
  void shouldIgnoreAStatusThatIsAlreadyApplied() {
    when(userRepository.findById("user1")).thenReturn(Optional.of(user("user1", UserRole.USER)));

    adminUserService.changeStatus("admin1", "user1", UserStatus.ACTIVE, "Motivo qualquer aqui");

    verify(userRepository, never()).save(any());
    verify(adminActionRepository, never()).save(any());
  }

  @Test
  void shouldClearOnlyTheSelectedProfileFields() {
    User target = user("user1", UserRole.USER);
    target.setBio("bio ofensiva");
    target.setLinks(List.of("https://exemplo.com"));
    target.setCity("Santos");
    target.setState("SP");
    when(userRepository.findById("user1")).thenReturn(Optional.of(target));
    when(userRepository.save(target)).thenReturn(target);

    adminUserService.moderateProfile(
        "admin1", "user1", List.of(ModeratedProfileField.BIO, ModeratedProfileField.LOCATION),
        "Bio com conteúdo impróprio");

    assertNull(target.getBio());
    assertNull(target.getCity());
    assertNull(target.getState());
    assertEquals(List.of("https://exemplo.com"), target.getLinks());
    assertEquals("Nome user1", target.getName());
    AdminAction action = savedAction();
    assertEquals(AdminActionType.PROFILE_MODERATED, action.getType());
    assertEquals(
        List.of(ModeratedProfileField.BIO, ModeratedProfileField.LOCATION), action.getFields());
  }

  @Test
  void shouldListTheUserActionsWithTheParticipantNames() {
    AdminAction action = new AdminAction();
    action.setActorId("admin1");
    action.setTargetId("user1");
    action.setType(AdminActionType.ACCOUNT_SUSPENDED);
    when(userRepository.findById("user1")).thenReturn(Optional.of(user("user1", UserRole.USER)));
    when(adminActionRepository.findByTargetIdOrderByCreatedAtDesc(eq("user1"), any(Pageable.class)))
        .thenReturn(List.of(action));
    when(userRepository.findAllById(any()))
        .thenReturn(List.of(user("admin1", UserRole.ADMIN), user("user1", UserRole.USER)));

    List<AdminActionResponse> actions = adminUserService.userActions("user1");

    assertEquals("Nome admin1", actions.get(0).actor().name());
    assertEquals("Nome user1", actions.get(0).target().name());
  }

  private AdminAction savedAction() {
    ArgumentCaptor<AdminAction> captor = ArgumentCaptor.forClass(AdminAction.class);
    verify(adminActionRepository).save(captor.capture());
    return captor.getValue();
  }

  private User user(String id, UserRole role) {
    User user = new User();
    user.setId(id);
    user.setName("Nome " + id);
    user.setEmail(id + "@email.com");
    user.setPasswordHash("hash");
    user.setRole(role);
    user.setRegistrationDate(Instant.parse("2026-10-02T18:00:00Z"));
    return user;
  }
}
