package com.projectd.nessfit.auth.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.auth.domain.AccountStatus;
import com.projectd.nessfit.auth.domain.AppUser;
import com.projectd.nessfit.auth.dto.ChangePasswordRequest;
import com.projectd.nessfit.auth.dto.DeleteAccountRequest;
import com.projectd.nessfit.auth.dto.UpdateProfileRequest;
import com.projectd.nessfit.auth.dto.UserResponse;
import com.projectd.nessfit.auth.repository.UserRepository;
import com.projectd.nessfit.common.exception.AuthenticationFailedException;
import com.projectd.nessfit.common.exception.ConflictException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthService authService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        return UserResponse.from(findActiveUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        AppUser user = findActiveUser(userId);
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(email)
                .filter(existingUser -> !existingUser.getId().equals(userId))
                .ifPresent(existingUser -> {
                    throw new ConflictException("An account already exists for this email address");
                });

        boolean emailChanged = !user.getEmail().equals(email);
        user.updateProfile(request.fullName().trim(), email);
        userRepository.save(user);
        if (emailChanged) {
            authService.revokeAllRefreshTokens(userId);
        }
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        AppUser user = findActiveUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AuthenticationFailedException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ConflictException("New password must be different from the current password");
        }

        user.updatePassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        authService.revokeAllRefreshTokens(userId);
    }

    @Transactional
    public void deleteAccount(UUID userId, DeleteAccountRequest request) {
        AppUser user = findActiveUser(userId);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationFailedException("Password is incorrect");
        }

        user.delete();
        userRepository.save(user);
        authService.revokeAllRefreshTokens(userId);
    }

    private AppUser findActiveUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AuthenticationFailedException("This account is no longer active");
        }
        return user;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
