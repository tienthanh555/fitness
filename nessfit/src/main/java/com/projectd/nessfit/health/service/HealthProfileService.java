package com.projectd.nessfit.health.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.common.exception.BadRequestException;
import com.projectd.nessfit.common.exception.ConflictException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;
import com.projectd.nessfit.health.domain.BodyWeightHistory;
import com.projectd.nessfit.health.domain.HealthGoal;
import com.projectd.nessfit.health.domain.HealthProfile;
import com.projectd.nessfit.health.domain.NutritionTarget;
import com.projectd.nessfit.health.dto.HealthProfileResponse;
import com.projectd.nessfit.health.dto.NutritionTargetResponse;
import com.projectd.nessfit.health.dto.OnboardingRequest;
import com.projectd.nessfit.health.dto.WeightMeasurementRequest;
import com.projectd.nessfit.health.dto.WeightHistoryResponse;
import com.projectd.nessfit.health.repository.BodyWeightHistoryRepository;
import com.projectd.nessfit.health.repository.HealthProfileRepository;
import com.projectd.nessfit.health.repository.NutritionTargetHistoryRepository;
import com.projectd.nessfit.health.repository.NutritionTargetRepository;

@Service
public class HealthProfileService {

    private final HealthProfileRepository profileRepository;
    private final NutritionTargetRepository targetRepository;
    private final NutritionTargetHistoryRepository targetHistoryRepository;
    private final BodyWeightHistoryRepository weightHistoryRepository;
    private final HealthCalculationService calculationService;

    public HealthProfileService(HealthProfileRepository profileRepository, NutritionTargetRepository targetRepository,
            NutritionTargetHistoryRepository targetHistoryRepository, BodyWeightHistoryRepository weightHistoryRepository,
            HealthCalculationService calculationService) {
        this.profileRepository = profileRepository;
        this.targetRepository = targetRepository;
        this.targetHistoryRepository = targetHistoryRepository;
        this.weightHistoryRepository = weightHistoryRepository;
        this.calculationService = calculationService;
    }

    @Transactional
    public HealthProfileResponse completeOnboarding(UUID userId, OnboardingRequest request) {
        validateGoal(request);
        HealthProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> new HealthProfile(userId, request.gender(), request.dateOfBirth(), request.heightCm(),
                        request.currentWeightKg(), request.activityLevel(), request.goal(), normalizedTarget(request)));
        profile.update(request.gender(), request.dateOfBirth(), request.heightCm(), request.currentWeightKg(),
                request.activityLevel(), request.goal(), normalizedTarget(request));
        profile.completeOnboarding();
        profileRepository.save(profile);

        saveWeightHistory(userId, request.currentWeightKg());
        NutritionTarget target = saveCalculatedTarget(userId, profile);
        return response(profile, target, calculationService.calculate(profile).bmi());
    }

    @Transactional(readOnly = true)
    public HealthProfileResponse getProfile(UUID userId) {
        HealthProfile profile = findProfile(userId);
        NutritionTarget target = targetRepository.findByUserId(userId).orElse(null);
        CalculatedNutrition calculated = calculationService.calculate(profile);
        return response(profile, target, calculated.bmi());
    }

    @Transactional(readOnly = true)
    public NutritionTargetResponse getTargets(UUID userId) {
        return targetRepository.findByUserId(userId)
                .map(NutritionTargetResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition targets not found"));
    }

    @Transactional
    public NutritionTargetResponse recalculateTargets(UUID userId) {
        HealthProfile profile = findProfile(userId);
        if (!profile.isOnboardingCompleted()) {
            throw new BadRequestException("Complete onboarding before calculating nutrition targets");
        }
        return NutritionTargetResponse.from(saveCalculatedTarget(userId, profile));
    }

    @Transactional(readOnly = true)
    public java.util.List<WeightHistoryResponse> getWeightHistory(UUID userId) {
        return weightHistoryRepository.findAllByUserIdOrderByMeasuredAtAsc(userId).stream()
                .map(WeightHistoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<WeightHistoryResponse> getWeightHistory(UUID userId, LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return getWeightHistory(userId);
        }
        LocalDate normalizedFrom = from == null ? LocalDate.of(1970, 1, 1) : from;
        LocalDate normalizedTo = to == null ? LocalDate.now() : to;
        validateDateRange(normalizedFrom, normalizedTo);
        return weightHistoryRepository.findAllByUserIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(userId,
                        normalizedFrom, normalizedTo).stream()
                .map(WeightHistoryResponse::from)
                .toList();
    }

    @Transactional
    public WeightHistoryResponse saveWeightMeasurement(UUID userId, WeightMeasurementRequest request) {
        BodyWeightHistory item = weightHistoryRepository.findByUserIdAndMeasuredAt(userId, request.measuredAt())
                .orElseGet(() -> new BodyWeightHistory(userId, request.measuredAt(), request.weightKg()));
        item.updateWeight(request.weightKg());
        return WeightHistoryResponse.from(weightHistoryRepository.save(item));
    }

    @Transactional
    public WeightHistoryResponse updateWeightMeasurement(UUID userId, UUID measurementId,
            WeightMeasurementRequest request) {
        BodyWeightHistory item = weightHistoryRepository.findByIdAndUserId(measurementId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Weight measurement not found"));
        weightHistoryRepository.findByUserIdAndMeasuredAt(userId, request.measuredAt())
                .filter(existing -> !existing.getId().equals(measurementId))
                .ifPresent(existing -> { throw new ConflictException("A measurement already exists for this date"); });
        item.updateMeasurement(request.measuredAt(), request.weightKg());
        return WeightHistoryResponse.from(weightHistoryRepository.save(item));
    }

    @Transactional
    public void deleteWeightMeasurement(UUID userId, UUID measurementId) {
        BodyWeightHistory item = weightHistoryRepository.findByIdAndUserId(measurementId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Weight measurement not found"));
        weightHistoryRepository.delete(item);
    }

    private HealthProfile findProfile(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found"));
    }

    private HealthProfileResponse response(HealthProfile profile, NutritionTarget target, BigDecimal bmi) {
        return HealthProfileResponse.from(profile, bmi, target == null ? null : NutritionTargetResponse.from(target));
    }

    private NutritionTarget saveCalculatedTarget(UUID userId, HealthProfile profile) {
        CalculatedNutrition calculated = calculationService.calculate(profile);
        Instant now = Instant.now();
        NutritionTarget target = targetRepository.findByUserId(userId)
                .orElseGet(() -> new NutritionTarget(userId, calculated.calories(), calculated.proteinGrams(),
                        calculated.carbohydratesGrams(), calculated.fatGrams(), calculated.bmr(), calculated.tdee(), now));
        boolean newTarget = target.getId() == null;
        boolean changed = target.getCalories() != calculated.calories()
                || target.getProteinGrams().compareTo(calculated.proteinGrams()) != 0
                || target.getCarbohydratesGrams().compareTo(calculated.carbohydratesGrams()) != 0
                || target.getFatGrams().compareTo(calculated.fatGrams()) != 0
                || target.getBmr() != calculated.bmr() || target.getTdee() != calculated.tdee();
        target.update(calculated.calories(), calculated.proteinGrams(), calculated.carbohydratesGrams(),
                calculated.fatGrams(), calculated.bmr(), calculated.tdee(), now);
        NutritionTarget saved = targetRepository.save(target);
        if (changed || newTarget) {
            targetHistoryRepository.save(new com.projectd.nessfit.health.domain.NutritionTargetHistory(userId, saved));
        }
        return saved;
    }

    private void saveWeightHistory(UUID userId, BigDecimal weightKg) {
        LocalDate today = LocalDate.now();
        BodyWeightHistory item = weightHistoryRepository.findByUserIdAndMeasuredAt(userId, today)
                .orElseGet(() -> new BodyWeightHistory(userId, today, weightKg));
        item.updateWeight(weightKg);
        weightHistoryRepository.save(item);
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new BadRequestException("Measurement start date cannot be after end date");
        }
        if (to.isAfter(LocalDate.now())) {
            throw new BadRequestException("Measurement end date cannot be in the future");
        }
    }

    private BigDecimal normalizedTarget(OnboardingRequest request) {
        return request.goal() == HealthGoal.MAINTAIN_WEIGHT ? null : request.targetWeightKg();
    }

    private void validateGoal(OnboardingRequest request) {
        if (request.goal() == HealthGoal.MAINTAIN_WEIGHT) {
            return;
        }
        if (request.targetWeightKg() == null) {
            throw new BadRequestException("Target weight is required for this goal");
        }
        int comparison = request.targetWeightKg().compareTo(request.currentWeightKg());
        if (request.goal() == HealthGoal.LOSE_WEIGHT && comparison >= 0) {
            throw new BadRequestException("Target weight must be lower than current weight when losing weight");
        }
        if (request.goal() == HealthGoal.GAIN_WEIGHT && comparison <= 0) {
            throw new BadRequestException("Target weight must be higher than current weight when gaining weight");
        }
    }
}
