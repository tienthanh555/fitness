package com.projectd.nessfit.auth.service;

import java.time.Duration;

import com.projectd.nessfit.auth.dto.AuthResponse;

public record AuthSession(AuthResponse response, String refreshToken, Duration refreshTokenTtl) {
}
