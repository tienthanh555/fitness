package com.projectd.nessfit.dashboard.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.common.response.ApiResponse;
import com.projectd.nessfit.dashboard.dto.DashboardSummaryResponse;
import com.projectd.nessfit.dashboard.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) LocalDate date) {
        return ApiResponse.success(dashboardService.getSummary(UUID.fromString(jwt.getSubject()), date));
    }
}
