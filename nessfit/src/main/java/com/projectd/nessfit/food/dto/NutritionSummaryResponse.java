package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record NutritionSummaryResponse(
        LocalDate date,
        BigDecimal calories,
        BigDecimal proteinGrams,
        BigDecimal carbohydratesGrams,
        BigDecimal fatGrams,
        Integer targetCalories,
        BigDecimal targetProteinGrams,
        BigDecimal targetCarbohydratesGrams,
        BigDecimal targetFatGrams,
        List<MealSummaryResponse> meals
) {
}
