package com.projectd.nessfit.health.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.health.domain.NutritionTarget;

public interface NutritionTargetRepository extends JpaRepository<NutritionTarget, UUID> {
    Optional<NutritionTarget> findByUserId(UUID userId);
}
