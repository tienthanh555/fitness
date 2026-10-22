package com.projectd.nessfit.food.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.food.dto.FoodDiaryItemRequest;
import com.projectd.nessfit.food.dto.FoodDiaryItemResponse;
import com.projectd.nessfit.food.dto.NutritionSummaryResponse;
import com.projectd.nessfit.food.service.FoodDiaryService;

@RestController
@RequestMapping("/nutrition")
public class NutritionController {
    private final FoodDiaryService diaryService;

    public NutritionController(FoodDiaryService diaryService) { this.diaryService = diaryService; }

    @GetMapping("/diary")
    public ApiResponse<List<FoodDiaryItemResponse>> diary(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) LocalDate date) {
        return ApiResponse.success(diaryService.getItems(userId(jwt), date == null ? LocalDate.now() : date));
    }

    @PostMapping("/diary/items")
    public ResponseEntity<ApiResponse<FoodDiaryItemResponse>> add(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody FoodDiaryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(diaryService.add(userId(jwt), request)));
    }

    @PutMapping("/diary/items/{id}")
    public ApiResponse<FoodDiaryItemResponse> update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody FoodDiaryItemRequest request) {
        return ApiResponse.success(diaryService.update(userId(jwt), id, request));
    }

    @DeleteMapping("/diary/items/{id}")
    public ApiResponse<MessageResponse> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        diaryService.delete(userId(jwt), id);
        return ApiResponse.success(new MessageResponse("Food removed from diary"));
    }

    @GetMapping("/summary")
    public ApiResponse<NutritionSummaryResponse> summary(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) LocalDate date) {
        return ApiResponse.success(diaryService.summary(userId(jwt), date == null ? LocalDate.now() : date));
    }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
