package com.projectd.nessfit.auth.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.dto.ChangePasswordRequest;
import com.projectd.nessfit.auth.dto.DeleteAccountRequest;
import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.auth.dto.UpdateProfileRequest;
import com.projectd.nessfit.auth.dto.UserResponse;
import com.projectd.nessfit.auth.service.UserService;
import com.projectd.nessfit.common.response.ApiResponse;

@RestController
@RequestMapping("/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<UserResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(userService.getProfile(userId(jwt)));
    }

    @PutMapping
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success(userService.updateProfile(userId(jwt), request));
    }

    @PostMapping("/password")
    public ResponseEntity<ApiResponse<MessageResponse>> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(userId(jwt), request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .body(ApiResponse.success(new MessageResponse("Password changed. Please sign in again.")));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<MessageResponse>> deleteAccount(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody DeleteAccountRequest request
    ) {
        userService.deleteAccount(userId(jwt), request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .body(ApiResponse.success(new MessageResponse("Account deleted successfully")));
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    private ResponseCookie expiredRefreshCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0)
                .build();
    }
}
