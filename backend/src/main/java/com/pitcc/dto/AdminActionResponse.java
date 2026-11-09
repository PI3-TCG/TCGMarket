package com.pitcc.dto;

import com.pitcc.model.AdminAction;
import com.pitcc.model.AdminActionType;
import com.pitcc.model.ModeratedProfileField;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import java.time.Instant;
import java.util.List;

public record AdminActionResponse(
    String id,
    AdminActionType type,
    String reason,
    UserRole role,
    List<ModeratedProfileField> fields,
    Instant createdAt,
    Participant actor,
    Participant target) {

  /** Conta removida do banco aparece sem nome, mas o registro da ação continua. */
  public record Participant(String id, String name, String username) {

    static Participant of(String id, User user) {
      return user == null
          ? new Participant(id, null, null)
          : new Participant(id, user.getName(), user.getUsername());
    }
  }

  public static AdminActionResponse from(AdminAction action, User actor, User target) {
    return new AdminActionResponse(
        action.getId(),
        action.getType(),
        action.getReason(),
        action.getRole(),
        action.getFields() == null ? List.of() : List.copyOf(action.getFields()),
        action.getCreatedAt(),
        Participant.of(action.getActorId(), actor),
        Participant.of(action.getTargetId(), target));
  }
}
