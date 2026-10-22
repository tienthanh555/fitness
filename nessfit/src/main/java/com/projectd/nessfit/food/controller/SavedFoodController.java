package com.projectd.nessfit.food.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.food.dto.FoodResponse;
import com.projectd.nessfit.food.service.SavedFoodService;

@RestController
@RequestMapping("/users/me/saved-foods")
public class SavedFoodController {
    private final SavedFoodService savedFoodService;

    public SavedFoodController(SavedFoodService savedFoodService) { this.savedFoodService = savedFoodService; }

    @GetMapping
    public ApiResponse<List<FoodResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(savedFoodService.list(userId(jwt)));
    }

    @PostMapping("/{foodId}")
    public ResponseEntity<ApiResponse<FoodResponse>> save(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID foodId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(savedFoodService.save(userId(jwt), foodId)));
    }

    @DeleteMapping("/{foodId}")
    public ApiResponse<MessageResponse> remove(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID foodId) {
        return ApiResponse.success(savedFoodService.remove(userId(jwt), foodId));
    }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
