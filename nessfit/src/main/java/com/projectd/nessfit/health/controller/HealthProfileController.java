package com.projectd.nessfit.health.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.health.dto.HealthProfileResponse;
import com.projectd.nessfit.health.dto.NutritionTargetResponse;
import com.projectd.nessfit.health.dto.OnboardingRequest;
import com.projectd.nessfit.health.dto.WeightMeasurementRequest;
import com.projectd.nessfit.health.dto.WeightHistoryResponse;
import com.projectd.nessfit.health.service.HealthProfileService;

@RestController
@RequestMapping("/users/me")
public class HealthProfileController {

    private final HealthProfileService healthProfileService;

    public HealthProfileController(HealthProfileService healthProfileService) {
        this.healthProfileService = healthProfileService;
    }

    @PutMapping("/onboarding")
    public ApiResponse<HealthProfileResponse> completeOnboarding(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingRequest request
    ) {
        return ApiResponse.success(healthProfileService.completeOnboarding(userId(jwt), request));
    }

    @GetMapping("/health-profile")
    public ApiResponse<HealthProfileResponse> getHealthProfile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(healthProfileService.getProfile(userId(jwt)));
    }

    @GetMapping("/nutrition-targets")
    public ApiResponse<NutritionTargetResponse> getNutritionTargets(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(healthProfileService.getTargets(userId(jwt)));
    }

    @PostMapping("/nutrition-targets/recalculate")
    public ApiResponse<NutritionTargetResponse> recalculateNutritionTargets(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(healthProfileService.recalculateTargets(userId(jwt)));
    }

    @GetMapping("/weight-history")
    public ApiResponse<List<WeightHistoryResponse>> getWeightHistory(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) java.time.LocalDate from,
            @RequestParam(required = false) java.time.LocalDate to) {
        return ApiResponse.success(healthProfileService.getWeightHistory(userId(jwt), from, to));
    }

    @PostMapping("/measurements")
    public org.springframework.http.ResponseEntity<ApiResponse<WeightHistoryResponse>> saveMeasurement(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody WeightMeasurementRequest request) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.created(healthProfileService.saveWeightMeasurement(userId(jwt), request)));
    }

    @PutMapping("/measurements/{id}")
    public ApiResponse<WeightHistoryResponse> updateMeasurement(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id, @Valid @RequestBody WeightMeasurementRequest request) {
        return ApiResponse.success(healthProfileService.updateWeightMeasurement(userId(jwt), id, request));
    }

    @DeleteMapping("/measurements/{id}")
    public ApiResponse<MessageResponse> deleteMeasurement(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        healthProfileService.deleteWeightMeasurement(userId(jwt), id);
        return ApiResponse.success(new MessageResponse("Weight measurement deleted"));
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
