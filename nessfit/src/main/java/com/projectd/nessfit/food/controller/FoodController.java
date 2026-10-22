package com.projectd.nessfit.food.controller;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.dto.PageResponse;
import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.food.dto.FoodResponse;
import com.projectd.nessfit.food.service.FoodService;

@RestController
@RequestMapping("/foods")
public class FoodController {
    private final FoodService foodService;

    public FoodController(FoodService foodService) { this.foodService = foodService; }

    @GetMapping("/search")
    public ApiResponse<PageResponse<FoodResponse>> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) BigDecimal minProtein,
            @RequestParam(required = false) BigDecimal maxCalories,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(foodService.search(query, minProtein, maxCalories, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<FoodResponse> detail(@PathVariable UUID id) {
        return ApiResponse.success(foodService.getActive(id));
    }
}
