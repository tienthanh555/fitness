package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.projectd.nessfit.food.domain.Food;

public record FoodResponse(
        UUID id,
        String name,
        BigDecimal caloriesPer100g,
        BigDecimal proteinPer100g,
        BigDecimal carbohydratesPer100g,
        BigDecimal fatPer100g,
        BigDecimal fiberPer100g,
        BigDecimal sugarPer100g,
        BigDecimal sodiumMgPer100g,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static FoodResponse from(Food food) {
        return new FoodResponse(food.getId(), food.getName(), food.getCaloriesPer100g(), food.getProteinPer100g(),
                food.getCarbohydratesPer100g(), food.getFatPer100g(), food.getFiberPer100g(), food.getSugarPer100g(),
                food.getSodiumMgPer100g(), food.isActive(), food.getCreatedAt(), food.getUpdatedAt());
    }
}
