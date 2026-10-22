package com.projectd.nessfit.food.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "foods")
public class Food extends BaseEntity {
    @Column(nullable = false, unique = true, length = 150)
    private String name;
    @Column(name = "calories_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal caloriesPer100g;
    @Column(name = "protein_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinPer100g;
    @Column(name = "carbohydrates_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbohydratesPer100g;
    @Column(name = "fat_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatPer100g;
    @Column(name = "fiber_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fiberPer100g;
    @Column(name = "sugar_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal sugarPer100g;
    @Column(name = "sodium_mg_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal sodiumMgPer100g;
    @Column(nullable = false)
    private boolean active;

    protected Food() { }

    public Food(String name, BigDecimal caloriesPer100g, BigDecimal proteinPer100g,
            BigDecimal carbohydratesPer100g, BigDecimal fatPer100g, BigDecimal fiberPer100g,
            BigDecimal sugarPer100g, BigDecimal sodiumMgPer100g, boolean active) {
        update(name, caloriesPer100g, proteinPer100g, carbohydratesPer100g, fatPer100g,
                fiberPer100g, sugarPer100g, sodiumMgPer100g, active);
    }

    public void update(String name, BigDecimal caloriesPer100g, BigDecimal proteinPer100g,
            BigDecimal carbohydratesPer100g, BigDecimal fatPer100g, BigDecimal fiberPer100g,
            BigDecimal sugarPer100g, BigDecimal sodiumMgPer100g, boolean active) {
        this.name = name;
        this.caloriesPer100g = caloriesPer100g;
        this.proteinPer100g = proteinPer100g;
        this.carbohydratesPer100g = carbohydratesPer100g;
        this.fatPer100g = fatPer100g;
        this.fiberPer100g = fiberPer100g;
        this.sugarPer100g = sugarPer100g;
        this.sodiumMgPer100g = sodiumMgPer100g;
        this.active = active;
    }

    public String getName() { return name; }
    public BigDecimal getCaloriesPer100g() { return caloriesPer100g; }
    public BigDecimal getProteinPer100g() { return proteinPer100g; }
    public BigDecimal getCarbohydratesPer100g() { return carbohydratesPer100g; }
    public BigDecimal getFatPer100g() { return fatPer100g; }
    public BigDecimal getFiberPer100g() { return fiberPer100g; }
    public BigDecimal getSugarPer100g() { return sugarPer100g; }
    public BigDecimal getSodiumMgPer100g() { return sodiumMgPer100g; }
    public boolean isActive() { return active; }
}
