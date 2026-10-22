package com.projectd.nessfit.food.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.common.exception.BadRequestException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;
import com.projectd.nessfit.food.domain.Food;
import com.projectd.nessfit.food.domain.FoodDiaryItem;
import com.projectd.nessfit.food.domain.MealType;
import com.projectd.nessfit.food.dto.FoodDiaryItemRequest;
import com.projectd.nessfit.food.dto.FoodDiaryItemResponse;
import com.projectd.nessfit.food.dto.MealSummaryResponse;
import com.projectd.nessfit.food.dto.NutritionSummaryResponse;
import com.projectd.nessfit.food.repository.FoodDiaryItemRepository;
import com.projectd.nessfit.food.repository.FoodRepository;
import com.projectd.nessfit.health.domain.NutritionTarget;
import com.projectd.nessfit.health.repository.NutritionTargetRepository;

@Service
public class FoodDiaryService {
    private final FoodRepository foodRepository;
    private final FoodDiaryItemRepository diaryRepository;
    private final NutritionTargetRepository targetRepository;

    public FoodDiaryService(FoodRepository foodRepository, FoodDiaryItemRepository diaryRepository,
            NutritionTargetRepository targetRepository) {
        this.foodRepository = foodRepository;
        this.diaryRepository = diaryRepository;
        this.targetRepository = targetRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodDiaryItemResponse> getItems(UUID userId, LocalDate date) {
        validateDate(date);
        return diaryRepository.findAllByUserIdAndLogDateOrderByCreatedAtAsc(userId, date).stream()
                .map(FoodDiaryItemResponse::from).toList();
    }

    @Transactional
    public FoodDiaryItemResponse add(UUID userId, FoodDiaryItemRequest request) {
        validateDate(request.logDate());
        Food food = activeFood(request.foodId());
        FoodDiaryItem item = new FoodDiaryItem(userId, food.getId(), request.logDate(), request.mealType(), request.quantityGrams(), food);
        return FoodDiaryItemResponse.from(diaryRepository.save(item));
    }

    @Transactional
    public FoodDiaryItemResponse update(UUID userId, UUID itemId, FoodDiaryItemRequest request) {
        validateDate(request.logDate());
        FoodDiaryItem item = diaryRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Food diary item not found"));
        Food food = activeFood(request.foodId());
        item.update(request.logDate(), request.mealType(), request.quantityGrams(), food);
        return FoodDiaryItemResponse.from(diaryRepository.save(item));
    }

    @Transactional
    public void delete(UUID userId, UUID itemId) {
        FoodDiaryItem item = diaryRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Food diary item not found"));
        diaryRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public NutritionSummaryResponse summary(UUID userId, LocalDate date) {
        validateDate(date);
        List<FoodDiaryItem> items = diaryRepository.findAllByUserIdAndLogDateOrderByCreatedAtAsc(userId, date);
        BigDecimal calories = total(items, Metric.CALORIES);
        BigDecimal protein = total(items, Metric.PROTEIN);
        BigDecimal carbohydrates = total(items, Metric.CARBOHYDRATES);
        BigDecimal fat = total(items, Metric.FAT);
        List<MealSummaryResponse> meals = new ArrayList<>();
        for (MealType mealType : MealType.values()) {
            List<FoodDiaryItem> mealItems = items.stream().filter(item -> item.getMealType() == mealType).toList();
            meals.add(new MealSummaryResponse(mealType.name(), mealItems.stream().map(FoodDiaryItemResponse::from).toList(),
                    total(mealItems, Metric.CALORIES), total(mealItems, Metric.PROTEIN),
                    total(mealItems, Metric.CARBOHYDRATES), total(mealItems, Metric.FAT)));
        }
        NutritionTarget target = targetRepository.findByUserId(userId).orElse(null);
        return new NutritionSummaryResponse(date, calories, protein, carbohydrates, fat,
                target == null ? null : target.getCalories(), target == null ? null : target.getProteinGrams(),
                target == null ? null : target.getCarbohydratesGrams(), target == null ? null : target.getFatGrams(), meals);
    }

    private Food activeFood(UUID id) {
        return foodRepository.findById(id).filter(Food::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Food not found"));
    }

    private void validateDate(LocalDate date) {
        if (date == null || date.isAfter(LocalDate.now())) throw new BadRequestException("Food diary date cannot be in the future");
    }

    private BigDecimal total(List<FoodDiaryItem> items, Metric metric) {
        return items.stream().map(metric::value).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private enum Metric {
        CALORIES { BigDecimal value(FoodDiaryItem item) { return item.getCalories(); } },
        PROTEIN { BigDecimal value(FoodDiaryItem item) { return item.getProteinGrams(); } },
        CARBOHYDRATES { BigDecimal value(FoodDiaryItem item) { return item.getCarbohydratesGrams(); } },
        FAT { BigDecimal value(FoodDiaryItem item) { return item.getFatGrams(); } };
        abstract BigDecimal value(FoodDiaryItem item);
    }
}
