package com.projectd.nessfit.auth.controller;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.domain.AccountStatus;
import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.auth.dto.PageResponse;
import com.projectd.nessfit.auth.dto.UserResponse;
import com.projectd.nessfit.auth.service.AdminUserService;
import com.projectd.nessfit.common.response.ApiResponse;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> findUsers(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return ApiResponse.success(adminUserService.findUsers(query, status, page, size));
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUser(@PathVariable UUID userId) {
        return ApiResponse.success(adminUserService.getUser(userId));
    }

    @PatchMapping("/{userId}/lock")
    public ApiResponse<UserResponse> lock(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID userId) {
        return ApiResponse.success(adminUserService.lock(actorId(jwt), userId));
    }

    @PatchMapping("/{userId}/unlock")
    public ApiResponse<UserResponse> unlock(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID userId) {
        return ApiResponse.success(adminUserService.unlock(actorId(jwt), userId));
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<MessageResponse> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID userId) {
        adminUserService.delete(actorId(jwt), userId);
        return ApiResponse.success(new MessageResponse("User account deleted successfully"));
    }

    private UUID actorId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
