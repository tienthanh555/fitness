package com.projectd.nessfit.health.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.projectd.nessfit.health.domain.HealthProfile;

public record HealthProfileResponse(
        UUID id,
        String gender,
        LocalDate dateOfBirth,
        BigDecimal heightCm,
        BigDecimal currentWeightKg,
        String activityLevel,
        String goal,
        BigDecimal targetWeightKg,
        boolean onboardingCompleted,
        BigDecimal bmi,
        NutritionTargetResponse nutritionTarget
) {
    public static HealthProfileResponse from(HealthProfile profile, BigDecimal bmi,
            NutritionTargetResponse nutritionTarget) {
        return new HealthProfileResponse(profile.getId(), profile.getGender().name(), profile.getDateOfBirth(),
                profile.getHeightCm(), profile.getCurrentWeightKg(), profile.getActivityLevel().name(),
                profile.getGoal().name(), profile.getTargetWeightKg(), profile.isOnboardingCompleted(), bmi,
                nutritionTarget);
    }
}
