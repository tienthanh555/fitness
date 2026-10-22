package com.projectd.nessfit.auth.security;

public final class PasswordRules {

    private PasswordRules() {
    }

    public static boolean isValid(String password) {
        return password != null
                && password.length() >= 8
                && password.length() <= 72
                && password.chars().anyMatch(Character::isUpperCase)
                && password.chars().anyMatch(Character::isDigit);
    }
}
