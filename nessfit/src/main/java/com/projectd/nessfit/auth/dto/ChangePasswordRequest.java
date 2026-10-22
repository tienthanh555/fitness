package com.projectd.nessfit.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank @Size(max = 72) String currentPassword,
        @NotBlank
        @Size(min = 8, max = 72, message = "Password must contain 8 to 72 characters")
        @Pattern(regexp = ".*[A-Z].*", message = "Password must include at least one uppercase letter")
        @Pattern(regexp = ".*[0-9].*", message = "Password must include at least one number")
        String newPassword
) {
}
