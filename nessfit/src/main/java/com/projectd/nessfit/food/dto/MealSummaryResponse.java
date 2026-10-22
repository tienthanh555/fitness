package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;
import java.util.List;

public record MealSummaryResponse(
        String mealType,
        List<FoodDiaryItemResponse> items,
        BigDecimal calories,
        BigDecimal proteinGrams,
        BigDecimal carbohydratesGrams,
        BigDecimal fatGrams
) {
}
