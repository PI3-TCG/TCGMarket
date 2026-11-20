package com.pitcc.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminDashboardActivityResponse(
    int days,
    boolean hasAdSeries,
    boolean hasSaleSeries,
    List<DailyActivity> daily
) {
  public record DailyActivity(
      LocalDate date,
      long newUsers,
      Long createdAds,
      Long completedSales
  ) {}
}
