create table foods (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    name varchar(150) not null unique,
    calories_per_100g numeric(8, 2) not null check (calories_per_100g >= 0),
    protein_per_100g numeric(8, 2) not null check (protein_per_100g >= 0),
    carbohydrates_per_100g numeric(8, 2) not null check (carbohydrates_per_100g >= 0),
    fat_per_100g numeric(8, 2) not null check (fat_per_100g >= 0),
    fiber_per_100g numeric(8, 2) not null default 0 check (fiber_per_100g >= 0),
    sugar_per_100g numeric(8, 2) not null default 0 check (sugar_per_100g >= 0),
    sodium_mg_per_100g numeric(8, 2) not null default 0 check (sodium_mg_per_100g >= 0),
    active boolean not null default true
);

create table food_diary_items (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    food_id uuid not null references foods(id),
    log_date date not null,
    meal_type varchar(20) not null check (meal_type in ('BREAKFAST', 'LUNCH', 'DINNER')),
    quantity_grams numeric(8, 2) not null check (quantity_grams > 0 and quantity_grams <= 10000),
    snapshot_food_name varchar(150) not null,
    calories numeric(10, 2) not null check (calories >= 0),
    protein_grams numeric(10, 2) not null check (protein_grams >= 0),
    carbohydrates_grams numeric(10, 2) not null check (carbohydrates_grams >= 0),
    fat_grams numeric(10, 2) not null check (fat_grams >= 0),
    fiber_grams numeric(10, 2) not null check (fiber_grams >= 0),
    sugar_grams numeric(10, 2) not null check (sugar_grams >= 0),
    sodium_mg numeric(10, 2) not null check (sodium_mg >= 0)
);

create table saved_foods (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    food_id uuid not null references foods(id),
    constraint uq_saved_food_user_food unique (user_id, food_id)
);

create index idx_foods_name on foods(name);
create index idx_foods_active on foods(active);
create index idx_food_diary_user_date on food_diary_items(user_id, log_date);
create index idx_saved_foods_user_id on saved_foods(user_id);

insert into foods (id, created_at, updated_at, name, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_mg_per_100g, active)
values
('10000000-0000-0000-0000-000000000001', now(), now(), 'Chicken Breast, Roasted', 165, 31, 0, 3.6, 0, 0, 74, true),
('10000000-0000-0000-0000-000000000002', now(), now(), 'White Rice, Cooked', 130, 2.7, 28.2, 0.3, 0.4, 0.1, 1, true),
('10000000-0000-0000-0000-000000000003', now(), now(), 'Brown Rice, Cooked', 123, 2.7, 25.6, 1, 1.6, 0.2, 4, true),
('10000000-0000-0000-0000-000000000004', now(), now(), 'Egg, Boiled', 155, 12.6, 1.1, 10.6, 0, 1.1, 124, true),
('10000000-0000-0000-0000-000000000005', now(), now(), 'Salmon, Grilled', 206, 22.1, 0, 12.4, 0, 0, 59, true),
('10000000-0000-0000-0000-000000000006', now(), now(), 'Tuna, Canned in Water', 116, 25.5, 0, 0.8, 0, 0, 247, true),
('10000000-0000-0000-0000-000000000007', now(), now(), 'Greek Yogurt, Plain', 97, 9, 3.9, 5, 0, 3.2, 35, true),
('10000000-0000-0000-0000-000000000008', now(), now(), 'Banana', 89, 1.1, 22.8, 0.3, 2.6, 12.2, 1, true),
('10000000-0000-0000-0000-000000000009', now(), now(), 'Sweet Potato, Boiled', 76, 1.4, 17.7, 0.1, 2.5, 5.7, 27, true),
('10000000-0000-0000-0000-000000000010', now(), now(), 'Oats, Dry', 389, 16.9, 66.3, 6.9, 10.6, 0.99, 2, true),
('10000000-0000-0000-0000-000000000011', now(), now(), 'Tofu, Firm', 144, 17.3, 2.8, 8.7, 2.3, 0.6, 14, true),
('10000000-0000-0000-0000-000000000012', now(), now(), 'Beef Sirloin, Grilled', 206, 29, 0, 9, 0, 0, 55, true),
('10000000-0000-0000-0000-000000000013', now(), now(), 'Pork Tenderloin, Roasted', 143, 26, 0, 3.5, 0, 0, 50, true),
('10000000-0000-0000-0000-000000000014', now(), now(), 'Shrimp, Boiled', 99, 24, 0.2, 0.3, 0, 0, 111, true),
('10000000-0000-0000-0000-000000000015', now(), now(), 'Avocado', 160, 2, 8.5, 14.7, 6.7, 0.7, 7, true);
