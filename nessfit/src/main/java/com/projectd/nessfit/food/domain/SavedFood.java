package com.projectd.nessfit.food.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "saved_foods")
public class SavedFood extends BaseEntity {
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "food_id", nullable = false)
    private UUID foodId;

    protected SavedFood() { }
    public SavedFood(UUID userId, UUID foodId) { this.userId = userId; this.foodId = foodId; }
    public UUID getUserId() { return userId; }
    public UUID getFoodId() { return foodId; }
}
