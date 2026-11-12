package com.pitcc.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Registro imutável de uma ação administrativa sobre a conta de um usuário. */
@Document(collection = "admin_actions")
@CompoundIndex(name = "admin_action_target_created", def = "{'targetId': 1, 'createdAt': -1}")
public class AdminAction {

  @Id private String id;

  private String actorId;

  private String targetId;

  private AdminActionType type;

  private String reason;

  private UserRole role;

  private List<ModeratedProfileField> fields;

  @Indexed private Instant createdAt;

  public AdminAction() {}

  public String getId() {
    return id;
  }

  public String getActorId() {
    return actorId;
  }

  public void setActorId(String actorId) {
    this.actorId = actorId;
  }

  public String getTargetId() {
    return targetId;
  }

  public void setTargetId(String targetId) {
    this.targetId = targetId;
  }

  public AdminActionType getType() {
    return type;
  }

  public void setType(AdminActionType type) {
    this.type = type;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public UserRole getRole() {
    return role;
  }

  public void setRole(UserRole role) {
    this.role = role;
  }

  public List<ModeratedProfileField> getFields() {
    return fields;
  }

  public void setFields(List<ModeratedProfileField> fields) {
    this.fields = fields;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
