package com.pitcc.dto;

import com.pitcc.model.CardGame;
import java.util.List;

/** Valores nulos representam indisponibilidade, nunca contagens inventadas. */
public record AdminDashboardOverviewResponse(
    Metric registeredUsers,
    Metric catalogCards,
    Metric activeAds,
    Metric completedSales,
    List<GameTotal> distribution
) {
  /** Variação entre o mês corrente e o anterior; null quando não há base comparável. */
  public record Metric(Long value, Double monthlyChangePercent) {}

  public record GameTotal(CardGame game, long totalCards) {}
}
