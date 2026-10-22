package com.projectd.nessfit.health.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import com.projectd.nessfit.health.domain.ActivityLevel;
import com.projectd.nessfit.health.domain.Gender;
import com.projectd.nessfit.health.domain.HealthGoal;

public record OnboardingRequest(
        @NotNull Gender gender,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull @DecimalMin("100.0") @DecimalMax("250.0") BigDecimal heightCm,
        @NotNull @DecimalMin("20.0") @DecimalMax("500.0") BigDecimal currentWeightKg,
        @NotNull ActivityLevel activityLevel,
        @NotNull HealthGoal goal,
        @DecimalMin("20.0") @DecimalMax("500.0") BigDecimal targetWeightKg
) {
}
