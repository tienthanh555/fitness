package com.projectd.nessfit.auth.controller;

import java.time.Duration;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectd.nessfit.auth.dto.AuthResponse;
import com.projectd.nessfit.auth.dto.ForgotPasswordRequest;
import com.projectd.nessfit.auth.dto.LoginRequest;
import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.auth.dto.RegisterRequest;
import com.projectd.nessfit.auth.service.AuthService;
import com.projectd.nessfit.auth.service.AuthSession;
import com.projectd.nessfit.common.response.ApiResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    private final AuthService authService;
    private final boolean refreshCookieSecure;

    public AuthController(
            AuthService authService,
            @Value("${app.auth.refresh-cookie.secure:false}") boolean refreshCookieSecure
    ) {
        this.authService = authService;
        this.refreshCookieSecure = refreshCookieSecure;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return sessionResponse(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return sessionResponse(authService.login(request), HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken
    ) {
        return sessionResponse(authService.refresh(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<MessageResponse>> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken
    ) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .body(ApiResponse.success(new MessageResponse("Signed out successfully")));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<MessageResponse>> logoutAll(@AuthenticationPrincipal Jwt jwt) {
        authService.revokeAllRefreshTokens(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .body(ApiResponse.success(new MessageResponse("Signed out from all devices")));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ApiResponse.success(new MessageResponse(
                "If an account exists for this email address, password reset instructions will be sent when email delivery is configured."
        ));
    }

    private ResponseEntity<ApiResponse<AuthResponse>> sessionResponse(AuthSession session, HttpStatus status) {
        ApiResponse<AuthResponse> response = status == HttpStatus.CREATED
                ? ApiResponse.created(session.response())
                : ApiResponse.success(session.response());
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, refreshCookie(session.refreshToken(), session.refreshTokenTtl()).toString())
                .body(response);
    }

    private ResponseCookie refreshCookie(String token, Duration maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return refreshCookie("", Duration.ZERO);
    }
}
