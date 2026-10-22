package com.projectd.nessfit.health.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "nutrition_targets")
public class NutritionTarget extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private int calories;

    @Column(name = "protein_grams", nullable = false, precision = 7, scale = 2)
    private BigDecimal proteinGrams;

    @Column(name = "carbohydrates_grams", nullable = false, precision = 7, scale = 2)
    private BigDecimal carbohydratesGrams;

    @Column(name = "fat_grams", nullable = false, precision = 7, scale = 2)
    private BigDecimal fatGrams;

    @Column(nullable = false)
    private int bmr;

    @Column(nullable = false)
    private int tdee;

    @Column(nullable = false)
    private Instant calculatedAt;

    protected NutritionTarget() {
    }

    public NutritionTarget(UUID userId, int calories, BigDecimal proteinGrams, BigDecimal carbohydratesGrams,
            BigDecimal fatGrams, int bmr, int tdee, Instant calculatedAt) {
        this.userId = userId;
        update(calories, proteinGrams, carbohydratesGrams, fatGrams, bmr, tdee, calculatedAt);
    }

    public void update(int calories, BigDecimal proteinGrams, BigDecimal carbohydratesGrams,
            BigDecimal fatGrams, int bmr, int tdee, Instant calculatedAt) {
        this.calories = calories;
        this.proteinGrams = proteinGrams;
        this.carbohydratesGrams = carbohydratesGrams;
        this.fatGrams = fatGrams;
        this.bmr = bmr;
        this.tdee = tdee;
        this.calculatedAt = calculatedAt;
    }

    public UUID getUserId() { return userId; }
    public int getCalories() { return calories; }
    public BigDecimal getProteinGrams() { return proteinGrams; }
    public BigDecimal getCarbohydratesGrams() { return carbohydratesGrams; }
    public BigDecimal getFatGrams() { return fatGrams; }
    public int getBmr() { return bmr; }
    public int getTdee() { return tdee; }
    public Instant getCalculatedAt() { return calculatedAt; }
}
