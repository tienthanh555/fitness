package com.projectd.nessfit.health.service;

import java.math.BigDecimal;

public record CalculatedNutrition(
        BigDecimal bmi,
        int bmr,
        int tdee,
        int calories,
        BigDecimal proteinGrams,
        BigDecimal carbohydratesGrams,
        BigDecimal fatGrams
) {
}
