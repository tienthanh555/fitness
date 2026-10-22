package com.projectd.nessfit.food.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.food.domain.FoodDiaryItem;

public interface FoodDiaryItemRepository extends JpaRepository<FoodDiaryItem, UUID> {
    List<FoodDiaryItem> findAllByUserIdAndLogDateOrderByCreatedAtAsc(UUID userId, LocalDate logDate);
    Optional<FoodDiaryItem> findByIdAndUserId(UUID id, UUID userId);
}
