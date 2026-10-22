package com.projectd.nessfit.food.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.projectd.nessfit.food.domain.Food;

public interface FoodRepository extends JpaRepository<Food, UUID> {
    Optional<Food> findByNameIgnoreCase(String name);
    Page<Food> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("""
            select f from Food f
            where f.active = true
              and (:query = '' or lower(f.name) like lower(concat('%', :query, '%')))
              and (:minProtein is null or f.proteinPer100g >= :minProtein)
              and (:maxCalories is null or f.caloriesPer100g <= :maxCalories)
            order by f.name asc
            """)
    Page<Food> searchActive(@Param("query") String query, @Param("minProtein") java.math.BigDecimal minProtein,
            @Param("maxCalories") java.math.BigDecimal maxCalories, Pageable pageable);
}
