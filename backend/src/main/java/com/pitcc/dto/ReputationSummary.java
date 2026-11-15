package com.pitcc.dto;

import java.util.Map;

public record ReputationSummary(Double average, long totalReviews, Map<Integer, Long> countsByRating) {

    public static ReputationSummary fromCounts(Map<Integer, Long> counts) {
        long total = 0;
        long sum = 0;
        Map<Integer, Long> distribution = new java.util.LinkedHashMap<>();
        for (int grade = 1; grade <= 5; grade++) {
            long count = counts.getOrDefault(grade, 0L);
            distribution.put(grade, count);
            total += count;
            sum += grade * count;
        }
        return new ReputationSummary(total == 0 ? null : (double) sum / total, total, Map.copyOf(distribution));
    }
}
