package com.projectd.nessfit.food.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "food_diary_items")
public class FoodDiaryItem extends BaseEntity {
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "food_id", nullable = false)
    private UUID foodId;
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;
    @Column(name = "quantity_grams", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityGrams;
    @Column(name = "snapshot_food_name", nullable = false, length = 150)
    private String snapshotFoodName;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal calories;
    @Column(name = "protein_grams", nullable = false, precision = 10, scale = 2) private BigDecimal proteinGrams;
    @Column(name = "carbohydrates_grams", nullable = false, precision = 10, scale = 2) private BigDecimal carbohydratesGrams;
    @Column(name = "fat_grams", nullable = false, precision = 10, scale = 2) private BigDecimal fatGrams;
    @Column(name = "fiber_grams", nullable = false, precision = 10, scale = 2) private BigDecimal fiberGrams;
    @Column(name = "sugar_grams", nullable = false, precision = 10, scale = 2) private BigDecimal sugarGrams;
    @Column(name = "sodium_mg", nullable = false, precision = 10, scale = 2) private BigDecimal sodiumMg;

    protected FoodDiaryItem() { }

    public FoodDiaryItem(UUID userId, UUID foodId, LocalDate logDate, MealType mealType,
            BigDecimal quantityGrams, Food food) {
        this.userId = userId;
        this.foodId = foodId;
        update(logDate, mealType, quantityGrams, food);
    }

    public void update(LocalDate logDate, MealType mealType, BigDecimal quantityGrams, Food food) {
        this.foodId = food.getId();
        this.logDate = logDate;
        this.mealType = mealType;
        this.quantityGrams = quantityGrams;
        this.snapshotFoodName = food.getName();
        BigDecimal ratio = quantityGrams.divide(BigDecimal.valueOf(100), 8, java.math.RoundingMode.HALF_UP);
        this.calories = food.getCaloriesPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.proteinGrams = food.getProteinPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.carbohydratesGrams = food.getCarbohydratesPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.fatGrams = food.getFatPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.fiberGrams = food.getFiberPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.sugarGrams = food.getSugarPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
        this.sodiumMg = food.getSodiumMgPer100g().multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public UUID getUserId() { return userId; }
    public UUID getFoodId() { return foodId; }
    public LocalDate getLogDate() { return logDate; }
    public MealType getMealType() { return mealType; }
    public BigDecimal getQuantityGrams() { return quantityGrams; }
    public String getSnapshotFoodName() { return snapshotFoodName; }
    public BigDecimal getCalories() { return calories; }
    public BigDecimal getProteinGrams() { return proteinGrams; }
    public BigDecimal getCarbohydratesGrams() { return carbohydratesGrams; }
    public BigDecimal getFatGrams() { return fatGrams; }
    public BigDecimal getFiberGrams() { return fiberGrams; }
    public BigDecimal getSugarGrams() { return sugarGrams; }
    public BigDecimal getSodiumMg() { return sodiumMg; }
}
