package com.projectd.nessfit.food.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.auth.dto.MessageResponse;
import com.projectd.nessfit.common.exception.ConflictException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;
import com.projectd.nessfit.food.domain.SavedFood;
import com.projectd.nessfit.food.dto.FoodResponse;
import com.projectd.nessfit.food.repository.FoodRepository;
import com.projectd.nessfit.food.repository.SavedFoodRepository;

@Service
public class SavedFoodService {
    private final FoodRepository foodRepository;
    private final SavedFoodRepository savedFoodRepository;

    public SavedFoodService(FoodRepository foodRepository, SavedFoodRepository savedFoodRepository) {
        this.foodRepository = foodRepository;
        this.savedFoodRepository = savedFoodRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodResponse> list(UUID userId) {
        return savedFoodRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(saved -> foodRepository.findById(saved.getFoodId()).filter(food -> food.isActive())
                        .map(FoodResponse::from).orElse(null))
                .filter(java.util.Objects::nonNull).toList();
    }

    @Transactional
    public FoodResponse save(UUID userId, UUID foodId) {
        var food = foodRepository.findById(foodId).filter(f -> f.isActive())
                .orElseThrow(() -> new ResourceNotFoundException("Food not found"));
        if (savedFoodRepository.findByUserIdAndFoodId(userId, foodId).isPresent())
            throw new ConflictException("Food is already saved");
        savedFoodRepository.save(new SavedFood(userId, foodId));
        return FoodResponse.from(food);
    }

    @Transactional
    public MessageResponse remove(UUID userId, UUID foodId) {
        if (savedFoodRepository.findByUserIdAndFoodId(userId, foodId).isEmpty())
            throw new ResourceNotFoundException("Saved food not found");
        savedFoodRepository.deleteByUserIdAndFoodId(userId, foodId);
        return new MessageResponse("Food removed from saved foods");
    }
}
