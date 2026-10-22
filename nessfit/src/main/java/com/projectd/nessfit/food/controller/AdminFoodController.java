package com.projectd.nessfit.food.controller;

import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.auth.dto.PageResponse;
import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.food.dto.FoodRequest;
import com.projectd.nessfit.food.dto.FoodResponse;
import com.projectd.nessfit.food.service.FoodService;

@RestController
@RequestMapping("/admin/foods")
public class AdminFoodController {
    private final FoodService foodService;

    public AdminFoodController(FoodService foodService) { this.foodService = foodService; }

    @GetMapping
    public ApiResponse<PageResponse<FoodResponse>> list(@RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(foodService.adminList(query, page, size));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FoodResponse>> create(@Valid @RequestBody FoodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(foodService.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<FoodResponse> update(@PathVariable UUID id, @Valid @RequestBody FoodRequest request) {
        return ApiResponse.success(foodService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<MessageResponse> delete(@PathVariable UUID id) {
        foodService.delete(id);
        return ApiResponse.success(new MessageResponse("Food deactivated successfully"));
    }
}
