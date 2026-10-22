package com.projectd.nessfit.food.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectd.nessfit.food.domain.SavedFood;

public interface SavedFoodRepository extends JpaRepository<SavedFood, UUID> {
    List<SavedFood> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SavedFood> findByUserIdAndFoodId(UUID userId, UUID foodId);
    void deleteByUserIdAndFoodId(UUID userId, UUID foodId);
}
