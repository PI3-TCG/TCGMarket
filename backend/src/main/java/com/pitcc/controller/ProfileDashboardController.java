package com.pitcc.controller;

import com.pitcc.dto.AvatarConfirmRequest;
import com.pitcc.dto.AvatarUploadRequest;
import com.pitcc.dto.CollectionFilterOptionsResponse;
import com.pitcc.dto.CollectionFilters;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.dto.ProfileSettings;
import com.pitcc.integration.r2.AvatarStorage;
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
  @PostMapping("/me/profile/avatar/upload-url")
  public AvatarStorage.Ticket uploadUrl(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody AvatarUploadRequest request) {
    return service.prepareAvatar(id(user), request.contentType(), request.contentLength());
  }
  @PostMapping("/me/profile/avatar")
  public ProfileSettings confirmAvatar(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody AvatarConfirmRequest request) {
    return service.confirmAvatar(id(user), request.key());
  }
  @GetMapping("/{username}/profile/summary")
  public ResponseEntity<ProfileDashboardService.PublicSummary> summary(@PathVariable String username) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.publicSummary(username));
  }
  @GetMapping("/{username}/profile/collection")
  public ResponseEntity<Page<ProfileDashboardService.PublicCollectionItem>> collection(@PathVariable String username,
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) CardGame game,
      @RequestParam(required = false) String edition,
      @RequestParam(required = false) String rarity,
      @RequestParam(required = false) CardCondition condition,
      @RequestParam(required = false) CardLanguage language) {
    var filters = new CollectionFilters(search, game, edition, rarity, condition, language);
    return ResponseEntity.ok().cacheControl(CacheControl.noStore())
        .body(service.publicCollection(username, page, size, filters));
  }

  @GetMapping("/{username}/profile/collection/filter-options")
  public ResponseEntity<CollectionFilterOptionsResponse> collectionFilterOptions(@PathVariable String username) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore())
        .body(service.publicCollectionFilterOptions(username));
  }
}
