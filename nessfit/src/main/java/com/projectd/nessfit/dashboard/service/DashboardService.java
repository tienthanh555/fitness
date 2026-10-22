package com.projectd.nessfit.dashboard.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.common.exception.BadRequestException;
import com.projectd.nessfit.dashboard.dto.DailyNutritionResponse;
import com.projectd.nessfit.dashboard.dto.DashboardSummaryResponse;
import com.projectd.nessfit.food.dto.NutritionSummaryResponse;
import com.projectd.nessfit.food.service.FoodDiaryService;
import com.projectd.nessfit.health.dto.HealthProfileResponse;
import com.projectd.nessfit.health.dto.WeightHistoryResponse;
import com.projectd.nessfit.health.service.HealthProfileService;

@Service
public class DashboardService {
    private final FoodDiaryService foodDiaryService;
    private final HealthProfileService healthProfileService;

    public DashboardService(FoodDiaryService foodDiaryService, HealthProfileService healthProfileService) {
        this.foodDiaryService = foodDiaryService;
        this.healthProfileService = healthProfileService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(UUID userId, LocalDate requestedDate) {
        LocalDate date = requestedDate == null ? LocalDate.now() : requestedDate;
        if (date.isAfter(LocalDate.now())) {
            throw new BadRequestException("Dashboard date cannot be in the future");
        }

        HealthProfileResponse profile = healthProfileService.getProfile(userId);
        NutritionSummaryResponse nutrition = foodDiaryService.summary(userId, date);
        List<DailyNutritionResponse> calorieHistory = IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> foodDiaryService.summary(userId, date.minusDays(6L - offset)))
                .map(day -> new DailyNutritionResponse(day.date(), day.calories(), day.targetCalories()))
                .toList();

        List<WeightHistoryResponse> allWeightHistory = healthProfileService.getWeightHistory(userId);
        List<WeightHistoryResponse> dashboardWeightHistory = allWeightHistory.stream()
                .filter(item -> !item.measuredAt().isAfter(date) && !item.measuredAt().isBefore(date.minusDays(29)))
                .toList();
        WeightHistoryResponse currentMeasurement = allWeightHistory.stream()
                .filter(item -> !item.measuredAt().isAfter(date))
                .reduce((first, second) -> second)
                .orElse(null);
        WeightHistoryResponse startingMeasurement = allWeightHistory.stream()
                .filter(item -> !item.measuredAt().isAfter(date))
                .findFirst()
                .orElse(null);

        BigDecimal currentWeight = currentMeasurement == null ? profile.currentWeightKg() : currentMeasurement.weightKg();
        BigDecimal startingWeight = startingMeasurement == null ? currentWeight : startingMeasurement.weightKg();
        BigDecimal weightChange = currentWeight.subtract(startingWeight).setScale(2, RoundingMode.HALF_UP);

        return new DashboardSummaryResponse(date, nutrition, calorieHistory, dashboardWeightHistory,
                currentWeight, startingWeight, profile.targetWeightKg(), weightChange, profile.goal());
    }
}
