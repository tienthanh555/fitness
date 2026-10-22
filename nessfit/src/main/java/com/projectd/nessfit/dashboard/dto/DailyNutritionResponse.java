package com.projectd.nessfit.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyNutritionResponse(LocalDate date, BigDecimal calories, Integer targetCalories) {
}
