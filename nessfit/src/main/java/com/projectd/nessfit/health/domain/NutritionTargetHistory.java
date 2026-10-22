package com.projectd.nessfit.health.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "nutrition_target_history")
public class NutritionTargetHistory extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(nullable = false) private int calories;
    @Column(name = "protein_grams", nullable = false, precision = 7, scale = 2) private BigDecimal proteinGrams;
    @Column(name = "carbohydrates_grams", nullable = false, precision = 7, scale = 2) private BigDecimal carbohydratesGrams;
    @Column(name = "fat_grams", nullable = false, precision = 7, scale = 2) private BigDecimal fatGrams;
    @Column(nullable = false) private int bmr;
    @Column(nullable = false) private int tdee;
    @Column(nullable = false) private Instant calculatedAt;

    protected NutritionTargetHistory() {
    }

    public NutritionTargetHistory(UUID userId, NutritionTarget target) {
        this.userId = userId;
        this.calories = target.getCalories();
        this.proteinGrams = target.getProteinGrams();
        this.carbohydratesGrams = target.getCarbohydratesGrams();
        this.fatGrams = target.getFatGrams();
        this.bmr = target.getBmr();
        this.tdee = target.getTdee();
        this.calculatedAt = target.getCalculatedAt();
    }
}
