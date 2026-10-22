package com.projectd.nessfit.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.auth.domain.AccountStatus;
import com.projectd.nessfit.auth.domain.AppUser;
import com.projectd.nessfit.auth.domain.RefreshToken;
import com.projectd.nessfit.auth.domain.Role;
import com.projectd.nessfit.auth.dto.AuthResponse;
import com.projectd.nessfit.auth.dto.LoginRequest;
import com.projectd.nessfit.auth.dto.RegisterRequest;
import com.projectd.nessfit.auth.dto.UserResponse;
import com.projectd.nessfit.auth.repository.RefreshTokenRepository;
import com.projectd.nessfit.auth.repository.UserRepository;
import com.projectd.nessfit.common.exception.AccountLockedException;
import com.projectd.nessfit.common.exception.AuthenticationFailedException;
import com.projectd.nessfit.common.exception.ConflictException;

@Service
public class AuthService {

    private static final int MAXIMUM_FAILED_LOGIN_ATTEMPTS = 8;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Duration refreshTokenTtl;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.jwt.refresh-token-ttl}") Duration refreshTokenTtl
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenTtl = refreshTokenTtl;
    }

    @Transactional
    public AuthSession register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account already exists for this email address");
        }

        AppUser user = userRepository.save(new AppUser(
                email,
                request.fullName().trim(),
                passwordEncoder.encode(request.password()),
                Role.USER
        ));
        return issueSession(user);
    }

    @Transactional(noRollbackFor = {AuthenticationFailedException.class, AccountLockedException.class})
    public AuthSession login(LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new AuthenticationFailedException("Email or password is incorrect"));

        ensureAccountCanLogIn(user);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.registerFailedLogin(MAXIMUM_FAILED_LOGIN_ATTEMPTS);
            userRepository.save(user);

            if (user.getStatus() == AccountStatus.LOCKED) {
                throw new AccountLockedException("Your account is locked after 8 unsuccessful sign-in attempts. Contact an administrator to unlock it.");
            }

            int remainingAttempts = MAXIMUM_FAILED_LOGIN_ATTEMPTS - user.getFailedLoginAttempts();
            throw new AuthenticationFailedException(
                    "Email or password is incorrect. " + remainingAttempts + " sign-in attempts remaining before the account is locked."
            );
        }

        user.resetFailedLoginAttempts();
        userRepository.save(user);
        return issueSession(user);
    }

    @Transactional
    public AuthSession refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new AuthenticationFailedException("Refresh token is missing");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hash(rawRefreshToken))
                .orElseThrow(() -> new AuthenticationFailedException("Refresh token is invalid"));
        if (!refreshToken.isActive()) {
            refreshToken.revoke();
            refreshTokenRepository.save(refreshToken);
            throw new AuthenticationFailedException("Refresh token is expired or revoked");
        }

        AppUser user = refreshToken.getUser();
        ensureAccountCanLogIn(user);
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);
        return issueSession(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hash(rawRefreshToken)).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllRefreshTokens(UUID userId) {
        List<RefreshToken> refreshTokens = refreshTokenRepository.findByUserIdAndRevokedAtIsNull(userId);
        refreshTokens.forEach(RefreshToken::revoke);
        refreshTokenRepository.saveAll(refreshTokens);
    }

    private AuthSession issueSession(AppUser user) {
        String rawRefreshToken = generateRawToken();
        refreshTokenRepository.save(new RefreshToken(
                user,
                hash(rawRefreshToken),
                Instant.now().plus(refreshTokenTtl)
        ));

        AuthResponse response = new AuthResponse(
                jwtService.createAccessToken(user),
                "Bearer",
                jwtService.getAccessTokenExpiresInSeconds(),
                UserResponse.from(user)
        );
        return new AuthSession(response, rawRefreshToken, refreshTokenTtl);
    }

    private void ensureAccountCanLogIn(AppUser user) {
        if (user.getStatus() == AccountStatus.LOCKED) {
            throw new AccountLockedException("This account is locked. Contact an administrator to unlock it.");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AuthenticationFailedException("Email or password is incorrect");
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
