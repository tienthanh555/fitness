package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FoodRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull @DecimalMin("0") BigDecimal caloriesPer100g,
        @NotNull @DecimalMin("0") BigDecimal proteinPer100g,
        @NotNull @DecimalMin("0") BigDecimal carbohydratesPer100g,
        @NotNull @DecimalMin("0") BigDecimal fatPer100g,
        @NotNull @DecimalMin("0") BigDecimal fiberPer100g,
        @NotNull @DecimalMin("0") BigDecimal sugarPer100g,
        @NotNull @DecimalMin("0") BigDecimal sodiumMgPer100g,
        Boolean active
) {
}
