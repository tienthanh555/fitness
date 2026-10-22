package com.projectd.nessfit.health.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

import org.springframework.stereotype.Service;

import com.projectd.nessfit.health.domain.Gender;
import com.projectd.nessfit.health.domain.HealthGoal;
import com.projectd.nessfit.health.domain.HealthProfile;

@Service
public class HealthCalculationService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal FOUR = BigDecimal.valueOf(4);
    private static final BigDecimal NINE = BigDecimal.valueOf(9);
    private static final BigDecimal FAT_CALORIE_RATIO = BigDecimal.valueOf(0.25);

    public CalculatedNutrition calculate(HealthProfile profile) {
        int age = Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();
        if (age < 1) {
            age = 1;
        }

        BigDecimal weight = profile.getCurrentWeightKg();
        BigDecimal height = profile.getHeightCm();
        BigDecimal ageValue = BigDecimal.valueOf(age);
        BigDecimal bmrValue = weight.multiply(BigDecimal.TEN)
                .add(height.multiply(BigDecimal.valueOf(6.25)))
                .subtract(ageValue.multiply(BigDecimal.valueOf(5)))
                .add(profile.getGender() == Gender.MALE ? BigDecimal.valueOf(5) : BigDecimal.valueOf(-161));
        int bmr = bmrValue.setScale(0, RoundingMode.HALF_UP).intValue();
        int tdee = bmrValue.multiply(profile.getActivityLevel().getMultiplier())
                .setScale(0, RoundingMode.HALF_UP).intValue();

        BigDecimal calorieFactor = switch (profile.getGoal()) {
            case LOSE_WEIGHT -> BigDecimal.valueOf(0.85);
            case MAINTAIN_WEIGHT -> BigDecimal.ONE;
            case GAIN_WEIGHT -> BigDecimal.valueOf(1.10);
        };
        int calories = BigDecimal.valueOf(tdee).multiply(calorieFactor)
                .setScale(0, RoundingMode.HALF_UP).intValue();

        BigDecimal proteinMultiplier = profile.getGoal() == HealthGoal.MAINTAIN_WEIGHT
                ? BigDecimal.valueOf(1.6) : BigDecimal.valueOf(2.0);
        BigDecimal protein = weight.multiply(proteinMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fat = BigDecimal.valueOf(calories).multiply(FAT_CALORIE_RATIO)
                .divide(NINE, 2, RoundingMode.HALF_UP);
        BigDecimal carbsCalories = BigDecimal.valueOf(calories)
                .subtract(protein.multiply(FOUR))
                .subtract(fat.multiply(NINE));
        BigDecimal carbohydrates = carbsCalories.max(BigDecimal.ZERO)
                .divide(FOUR, 2, RoundingMode.HALF_UP);

        BigDecimal heightInMeters = height.divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal bmi = weight.divide(heightInMeters.multiply(heightInMeters), 2, RoundingMode.HALF_UP);

        return new CalculatedNutrition(bmi, bmr, tdee, calories, protein, carbohydrates, fat);
    }
}
