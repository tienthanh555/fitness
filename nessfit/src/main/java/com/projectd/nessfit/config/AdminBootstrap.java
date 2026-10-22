package com.projectd.nessfit.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.projectd.nessfit.auth.domain.AppUser;
import com.projectd.nessfit.auth.domain.Role;
import com.projectd.nessfit.auth.repository.UserRepository;
import com.projectd.nessfit.auth.security.PasswordRules;

@Configuration
public class AdminBootstrap {

    @Bean
    ApplicationRunner createInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL:}") String email,
            @Value("${ADMIN_PASSWORD:}") String password
    ) {
        return arguments -> {
            if (email.isBlank() && password.isBlank()) {
                return;
            }
            if (email.isBlank() || !PasswordRules.isValid(password)) {
                throw new IllegalStateException("Initial administrator configuration is invalid");
            }

            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                userRepository.save(new AppUser(
                        normalizedEmail,
                        "System Administrator",
                        passwordEncoder.encode(password),
                        Role.ADMIN
                ));
            }
        };
    }
}
