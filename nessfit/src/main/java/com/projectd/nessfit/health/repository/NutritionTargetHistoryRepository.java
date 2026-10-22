package com.projectd.nessfit.health.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.health.domain.NutritionTargetHistory;

public interface NutritionTargetHistoryRepository extends JpaRepository<NutritionTargetHistory, UUID> {
}
