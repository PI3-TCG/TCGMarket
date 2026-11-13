package com.pitcc.controller;

import com.pitcc.dto.ProfileSettings;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.security.AuthenticatedUser;
import com.pitcc.service.ProfileDashboardService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class ProfileDashboardController {
  private final ProfileDashboardService service;
  public ProfileDashboardController(ProfileDashboardService service) { this.service = service; }
  private String id(AuthenticatedUser user) {
    if (user == null) throw new InvalidAuthenticationException();
    return user.id();
  }
  @GetMapping("/me/profile/dashboard")
  public ProfileDashboardService.Dashboard dashboard(@AuthenticationPrincipal AuthenticatedUser user) {
    return service.dashboard(id(user));
  }
  @GetMapping("/me/profile/settings")
  public ProfileSettings settings(@AuthenticationPrincipal AuthenticatedUser user) { return service.settings(id(user)); }
  @PutMapping("/me/profile/settings")
  public ProfileSettings update(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody ProfileSettings settings) {
    return service.updateSettings(id(user), settings);
  }
  @GetMapping("/{username}/profile/summary")
  public ResponseEntity<ProfileDashboardService.PublicSummary> summary(@PathVariable String username) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.publicSummary(username));
  }
  @GetMapping("/{username}/profile/collection")
  public ResponseEntity<Page<ProfileDashboardService.PublicCollectionItem>> collection(@PathVariable String username,
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.publicCollection(username, page, size));
  }
}
