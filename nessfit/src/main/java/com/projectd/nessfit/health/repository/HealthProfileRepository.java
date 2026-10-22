package com.projectd.nessfit.health.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.health.domain.HealthProfile;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, UUID> {
    Optional<HealthProfile> findByUserId(UUID userId);
}
