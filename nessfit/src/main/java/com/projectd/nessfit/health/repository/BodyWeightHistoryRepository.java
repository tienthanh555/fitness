package com.projectd.nessfit.health.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.health.domain.BodyWeightHistory;

public interface BodyWeightHistoryRepository extends JpaRepository<BodyWeightHistory, UUID> {
    Optional<BodyWeightHistory> findByUserIdAndMeasuredAt(UUID userId, LocalDate measuredAt);
    Optional<BodyWeightHistory> findByIdAndUserId(UUID id, UUID userId);
    List<BodyWeightHistory> findAllByUserIdOrderByMeasuredAtAsc(UUID userId);
    List<BodyWeightHistory> findAllByUserIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(UUID userId, LocalDate from, LocalDate to);
}
