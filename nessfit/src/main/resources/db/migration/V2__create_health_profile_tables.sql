create table user_health_profiles (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null unique references users(id),
    gender varchar(20) not null check (gender in ('MALE', 'FEMALE')),
    date_of_birth date not null,
    height_cm numeric(5, 2) not null check (height_cm >= 100 and height_cm <= 250),
    current_weight_kg numeric(6, 2) not null check (current_weight_kg >= 20 and current_weight_kg <= 500),
    activity_level varchar(30) not null check (activity_level in ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE')),
    goal varchar(20) not null check (goal in ('LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_WEIGHT')),
    target_weight_kg numeric(6, 2) check (target_weight_kg is null or (target_weight_kg >= 20 and target_weight_kg <= 500)),
    onboarding_completed boolean not null default false
);

create table nutrition_targets (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null unique references users(id),
    calories integer not null check (calories > 0),
    protein_grams numeric(7, 2) not null check (protein_grams >= 0),
    carbohydrates_grams numeric(7, 2) not null check (carbohydrates_grams >= 0),
    fat_grams numeric(7, 2) not null check (fat_grams >= 0),
    bmr integer not null check (bmr > 0),
    tdee integer not null check (tdee > 0),
    calculated_at timestamp with time zone not null
);

create table nutrition_target_history (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    calories integer not null,
    protein_grams numeric(7, 2) not null,
    carbohydrates_grams numeric(7, 2) not null,
    fat_grams numeric(7, 2) not null,
    bmr integer not null,
    tdee integer not null,
    calculated_at timestamp with time zone not null
);

create table body_weight_history (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    measured_at date not null,
    weight_kg numeric(6, 2) not null check (weight_kg >= 20 and weight_kg <= 500),
    constraint uq_body_weight_history_user_date unique (user_id, measured_at)
);

create index idx_nutrition_target_history_user_id on nutrition_target_history(user_id);
create index idx_body_weight_history_user_id_measured_at on body_weight_history(user_id, measured_at);
