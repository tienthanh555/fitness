package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import com.projectd.nessfit.food.domain.MealType;

public record FoodDiaryItemRequest(
        @NotNull UUID foodId,
        @NotNull @PastOrPresent LocalDate logDate,
        @NotNull MealType mealType,
        @NotNull @DecimalMin("0.1") @DecimalMax("10000") BigDecimal quantityGrams
) {
}
