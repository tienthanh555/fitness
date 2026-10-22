package com.projectd.nessfit.food.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.projectd.nessfit.food.domain.FoodDiaryItem;

public record FoodDiaryItemResponse(
        UUID id,
        UUID foodId,
        String foodName,
        LocalDate logDate,
        String mealType,
        BigDecimal quantityGrams,
        BigDecimal calories,
        BigDecimal proteinGrams,
        BigDecimal carbohydratesGrams,
        BigDecimal fatGrams,
        BigDecimal fiberGrams,
        BigDecimal sugarGrams,
        BigDecimal sodiumMg
) {
    public static FoodDiaryItemResponse from(FoodDiaryItem item) {
        return new FoodDiaryItemResponse(item.getId(), item.getFoodId(), item.getSnapshotFoodName(), item.getLogDate(),
                item.getMealType().name(), item.getQuantityGrams(), item.getCalories(), item.getProteinGrams(),
                item.getCarbohydratesGrams(), item.getFatGrams(), item.getFiberGrams(), item.getSugarGrams(), item.getSodiumMg());
    }
}
