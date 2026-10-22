package com.projectd.nessfit.auth.dto;

import java.time.Instant;
import java.util.UUID;

import com.projectd.nessfit.auth.domain.AppUser;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        String role,
        String status,
        Instant createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }
}
