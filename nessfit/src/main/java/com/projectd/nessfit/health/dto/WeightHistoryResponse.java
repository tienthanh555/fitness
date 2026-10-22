package com.projectd.nessfit.health.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.projectd.nessfit.health.domain.BodyWeightHistory;

public record WeightHistoryResponse(UUID id, LocalDate measuredAt, BigDecimal weightKg) {
    public static WeightHistoryResponse from(BodyWeightHistory item) {
        return new WeightHistoryResponse(item.getId(), item.getMeasuredAt(), item.getWeightKg());
    }
}
