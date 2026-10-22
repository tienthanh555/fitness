package com.projectd.nessfit.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.projectd.nessfit.food.dto.NutritionSummaryResponse;
import com.projectd.nessfit.health.dto.WeightHistoryResponse;

public record DashboardSummaryResponse(
        LocalDate date,
        NutritionSummaryResponse nutrition,
        List<DailyNutritionResponse> calorieHistory,
        List<WeightHistoryResponse> weightHistory,
        BigDecimal currentWeightKg,
        BigDecimal startingWeightKg,
        BigDecimal targetWeightKg,
        BigDecimal weightChangeKg,
        String goal
) {
}
