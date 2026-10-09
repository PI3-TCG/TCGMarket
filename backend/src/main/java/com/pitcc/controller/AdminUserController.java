package com.pitcc.controller;

import com.pitcc.dto.UpdateUserRoleRequest;
import com.pitcc.dto.UserResponse;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.AdminUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  public AdminUserController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  @GetMapping
  public List<UserResponse> list() {
    return adminUserService.listUsers();
  }

  @PatchMapping("/{id}/role")
  public UserResponse changeRole(
      @AuthenticationPrincipal AuthenticatedUser actor,
      @PathVariable String id,
      @Valid @RequestBody UpdateUserRoleRequest request) {
    return adminUserService.changeRole(actor.id(), id, request.role());
  }
}
