package com.pitcc.controller;

import com.pitcc.dto.AdminActionResponse;
import com.pitcc.dto.AdminUserResponse;
import com.pitcc.dto.CatalogPageResponse;
import com.pitcc.dto.ModerateProfileRequest;
import com.pitcc.dto.UpdateUserRoleRequest;
import com.pitcc.dto.UpdateUserStatusRequest;
import com.pitcc.model.UserRole;
import com.pitcc.model.UserStatus;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.AdminUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

  private final AdminUserService adminUserService;

  public AdminUserController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  @GetMapping("/users")
  public CatalogPageResponse<AdminUserResponse> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UserRole role,
      @RequestParam(required = false) UserStatus status,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size) {
    return adminUserService.searchUsers(q, role, status, page, size);
  }

  @GetMapping("/users/{id}")
  public AdminUserResponse get(@PathVariable String id) {
    return adminUserService.getUser(id);
  }

  @GetMapping("/users/{id}/actions")
  public List<AdminActionResponse> actions(@PathVariable String id) {
    return adminUserService.userActions(id);
  }

  @PatchMapping("/users/{id}/role")
  public AdminUserResponse changeRole(
      @AuthenticationPrincipal AuthenticatedUser actor,
      @PathVariable String id,
      @Valid @RequestBody UpdateUserRoleRequest request) {
    return adminUserService.changeRole(actor.id(), id, request.role());
  }

  @PatchMapping("/users/{id}/status")
  public AdminUserResponse changeStatus(
      @AuthenticationPrincipal AuthenticatedUser actor,
      @PathVariable String id,
      @Valid @RequestBody UpdateUserStatusRequest request) {
    return adminUserService.changeStatus(actor.id(), id, request.status(), request.reason());
  }

  @PostMapping("/users/{id}/profile/moderation")
  public AdminUserResponse moderateProfile(
      @AuthenticationPrincipal AuthenticatedUser actor,
      @PathVariable String id,
      @Valid @RequestBody ModerateProfileRequest request) {
    return adminUserService.moderateProfile(actor.id(), id, request.fields(), request.reason());
  }

  @GetMapping("/events")
  public List<AdminActionResponse> events(@RequestParam(required = false) Integer limit) {
    return adminUserService.recentActions(limit);
  }
}
