package com.projectd.nessfit.health.domain;

import java.math.BigDecimal;

public enum ActivityLevel {
    SEDENTARY("Sedentary", "Mostly seated with little planned exercise", "1.2", 1.2),
    LIGHTLY_ACTIVE("Lightly Active", "Light exercise 1–3 days per week", "1.375", 1.375),
    MODERATELY_ACTIVE("Moderately Active", "Training 3–5 days per week", "1.55", 1.55),
    VERY_ACTIVE("Very Active", "Hard training 6–7 days per week", "1.725", 1.725),
    EXTRA_ACTIVE("Extra Active", "Physical work or twice-daily training", "1.9", 1.9);

    private final String label;
    private final String description;
    private final String multiplierText;
    private final BigDecimal multiplier;

    ActivityLevel(String label, String description, String multiplierText, double multiplier) {
        this.label = label;
        this.description = description;
        this.multiplierText = multiplierText;
        this.multiplier = BigDecimal.valueOf(multiplier);
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public String getMultiplierText() {
        return multiplierText;
    }

    public BigDecimal getMultiplier() {
        return multiplier;
    }
}
