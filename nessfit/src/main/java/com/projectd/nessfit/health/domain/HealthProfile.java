package com.projectd.nessfit.health.domain;

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
@Table(name = "user_health_profiles")
public class HealthProfile extends BaseEntity {
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Gender gender;
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;
    @Column(name = "height_cm", nullable = false, precision = 5, scale = 2)
    private BigDecimal heightCm;
    @Column(name = "current_weight_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal currentWeightKg;
    @Enumerated(EnumType.STRING) @Column(name = "activity_level", nullable = false, length = 30)
    private ActivityLevel activityLevel;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private HealthGoal goal;
    @Column(name = "target_weight_kg", precision = 6, scale = 2)
    private BigDecimal targetWeightKg;
    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted;

    protected HealthProfile() { }

    public HealthProfile(UUID userId, Gender gender, LocalDate dateOfBirth, BigDecimal heightCm,
            BigDecimal currentWeightKg, ActivityLevel activityLevel, HealthGoal goal,
            BigDecimal targetWeightKg) {
        this.userId = userId;
        update(gender, dateOfBirth, heightCm, currentWeightKg, activityLevel, goal, targetWeightKg);
    }

    public void update(Gender gender, LocalDate dateOfBirth, BigDecimal heightCm, BigDecimal currentWeightKg,
            ActivityLevel activityLevel, HealthGoal goal, BigDecimal targetWeightKg) {
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.heightCm = heightCm;
        this.currentWeightKg = currentWeightKg;
        this.activityLevel = activityLevel;
        this.goal = goal;
        this.targetWeightKg = targetWeightKg;
    }

    public void completeOnboarding() { this.onboardingCompleted = true; }
    public UUID getUserId() { return userId; }
    public Gender getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public BigDecimal getHeightCm() { return heightCm; }
    public BigDecimal getCurrentWeightKg() { return currentWeightKg; }
    public ActivityLevel getActivityLevel() { return activityLevel; }
    public HealthGoal getGoal() { return goal; }
    public BigDecimal getTargetWeightKg() { return targetWeightKg; }
    public boolean isOnboardingCompleted() { return onboardingCompleted; }
}
