package com.pitcc.controller;

import com.pitcc.dto.AdminDashboardActivityResponse;
import com.pitcc.dto.AdminDashboardOverviewResponse;
import com.pitcc.dto.AdminDashboardRecentAdResponse;
import com.pitcc.dto.AdminDashboardRecentUserResponse;
import com.pitcc.service.AdminDashboardService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
  private final AdminDashboardService dashboard;

  public AdminDashboardController(AdminDashboardService dashboard) {
    this.dashboard = dashboard;
  }

  @GetMapping("/overview")
  public AdminDashboardOverviewResponse overview() {
    return dashboard.overview();
  }

  @GetMapping("/activity")
  public AdminDashboardActivityResponse activity(
      @RequestParam(defaultValue = "30") int days) {
    if (days != 7 && days != 30 && days != 90) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use 7, 30 ou 90 dias.");
    }
    return dashboard.activity(days);
  }

  @GetMapping("/recent/users")
  public List<AdminDashboardRecentUserResponse> recentUsers() {
    return dashboard.recentUsers();
  }

  @GetMapping("/recent/ads")
  public List<AdminDashboardRecentAdResponse> recentAds() {
    return dashboard.recentAds();
  }
}
