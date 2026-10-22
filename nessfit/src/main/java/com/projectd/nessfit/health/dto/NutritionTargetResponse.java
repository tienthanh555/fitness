package com.projectd.nessfit.health.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.projectd.nessfit.health.domain.NutritionTarget;

public record NutritionTargetResponse(
        int calories,
        BigDecimal proteinGrams,
        BigDecimal carbohydratesGrams,
        BigDecimal fatGrams,
        int bmr,
        int tdee,
        Instant calculatedAt
) {
    public static NutritionTargetResponse from(NutritionTarget target) {
        return new NutritionTargetResponse(target.getCalories(), target.getProteinGrams(),
                target.getCarbohydratesGrams(), target.getFatGrams(), target.getBmr(),
                target.getTdee(), target.getCalculatedAt());
    }
}
