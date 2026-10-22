package com.projectd.nessfit.health.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "body_weight_history")
public class BodyWeightHistory extends BaseEntity {
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "measured_at", nullable = false)
    private LocalDate measuredAt;
    @Column(name = "weight_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal weightKg;

    protected BodyWeightHistory() {
    }

    public BodyWeightHistory(UUID userId, LocalDate measuredAt, BigDecimal weightKg) {
        this.userId = userId;
        this.measuredAt = measuredAt;
        this.weightKg = weightKg;
    }

    public void updateMeasurement(LocalDate measuredAt, BigDecimal weightKg) {
        this.measuredAt = measuredAt;
        this.weightKg = weightKg;
    }
    public void updateWeight(BigDecimal weightKg) { this.weightKg = weightKg; }
    public UUID getUserId() { return userId; }
    public LocalDate getMeasuredAt() { return measuredAt; }
    public BigDecimal getWeightKg() { return weightKg; }
}
