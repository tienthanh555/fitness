package com.projectd.nessfit.food.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.auth.dto.PageResponse;
import com.projectd.nessfit.common.exception.ConflictException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;
import com.projectd.nessfit.food.domain.Food;
import com.projectd.nessfit.food.dto.FoodRequest;
import com.projectd.nessfit.food.dto.FoodResponse;
import com.projectd.nessfit.food.repository.FoodRepository;

@Service
public class FoodService {
    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) { this.foodRepository = foodRepository; }

    @Transactional(readOnly = true)
    public PageResponse<FoodResponse> search(String query, java.math.BigDecimal minProtein,
            java.math.BigDecimal maxCalories, int page, int size) {
        String normalized = query == null ? "" : query.trim();
        var result = foodRepository.searchActive(normalized, minProtein, maxCalories,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return PageResponse.from(result.map(FoodResponse::from));
    }

    @Transactional(readOnly = true)
    public FoodResponse getActive(UUID id) {
        Food food = foodRepository.findById(id)
                .filter(Food::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Food not found"));
        return FoodResponse.from(food);
    }

    @Transactional(readOnly = true)
    public PageResponse<FoodResponse> adminList(String query, int page, int size) {
        String normalized = query == null ? "" : query.trim();
        var result = foodRepository.findByNameContainingIgnoreCase(normalized,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("name").ascending()));
        return PageResponse.from(result.map(FoodResponse::from));
    }

    @Transactional
    public FoodResponse create(FoodRequest request) {
        String name = normalizeName(request.name());
        foodRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            throw new ConflictException("A food with this name already exists");
        });
        Food food = new Food(name, request.caloriesPer100g(), request.proteinPer100g(), request.carbohydratesPer100g(),
                request.fatPer100g(), request.fiberPer100g(), request.sugarPer100g(), request.sodiumMgPer100g(),
                request.active() == null || request.active());
        return FoodResponse.from(foodRepository.save(food));
    }

    @Transactional
    public FoodResponse update(UUID id, FoodRequest request) {
        Food food = foodRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Food not found"));
        String name = normalizeName(request.name());
        foodRepository.findByNameIgnoreCase(name).filter(existing -> !existing.getId().equals(id)).ifPresent(existing -> {
            throw new ConflictException("A food with this name already exists");
        });
        food.update(name, request.caloriesPer100g(), request.proteinPer100g(), request.carbohydratesPer100g(),
                request.fatPer100g(), request.fiberPer100g(), request.sugarPer100g(), request.sodiumMgPer100g(),
                request.active() == null || request.active());
        return FoodResponse.from(foodRepository.save(food));
    }

    @Transactional
    public void delete(UUID id) {
        Food food = foodRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Food not found"));
        food.update(food.getName(), food.getCaloriesPer100g(), food.getProteinPer100g(), food.getCarbohydratesPer100g(),
                food.getFatPer100g(), food.getFiberPer100g(), food.getSugarPer100g(), food.getSodiumMgPer100g(), false);
        foodRepository.save(food);
    }

    private String normalizeName(String name) { return name.trim().replaceAll("\\s+", " "); }
}
