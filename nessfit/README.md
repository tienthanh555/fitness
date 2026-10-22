# NessFit backend

## Local prerequisites

- Java 25
- Docker Desktop

## Run locally

1. Copy `.env.example` to `.env` and set the PostgreSQL, JWT and initial administrator values.
   The default local port is `5433`, because this computer already uses `5432` for another PostgreSQL instance.
2. Start PostgreSQL with `docker compose up -d`.
3. Run tests with `./gradlew.bat clean test`.
4. Start the API with `./gradlew.bat bootRun`.

## Local endpoints

- Health: `http://localhost:8080/api/actuator/health`
- Swagger UI: `http://localhost:8080/api/swagger-ui/index.html`

## Configuration rules

- Put local secrets only in `.env`; do not commit that file.
- Put database schema changes in `src/main/resources/db/migration` as Flyway migrations.
- Keep Hibernate at `ddl-auto: validate`; Flyway owns the schema.
- `JWT_SECRET` must be a Base64-encoded random value with at least 32 bytes. Never commit it.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` create the initial Admin only when that email does not already exist.
- Refresh tokens are stored as hashes in PostgreSQL and sent in an `HttpOnly` cookie. Set `app.auth.refresh-cookie.secure=true` for HTTPS deployments.

## Auth endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/logout-all`
- `POST /api/auth/forgot-password` accepts a request without revealing whether the email exists. Email reset-link delivery is pending provider configuration.
- `GET|PUT|DELETE /api/users/me`, `POST /api/users/me/password`
- `PUT /api/users/me/onboarding` saves the health profile and calculates BMI, BMR, TDEE and nutrition targets.
- `GET /api/users/me/health-profile`, `GET /api/users/me/nutrition-targets`, `POST /api/users/me/nutrition-targets/recalculate`
- `GET /api/users/me/weight-history` returns the user's weight history created from onboarding updates.
- `GET /api/admin/users`, `GET /api/admin/users/{id}`, `PATCH /api/admin/users/{id}/lock`, `PATCH /api/admin/users/{id}/unlock`, `DELETE /api/admin/users/{id}`

## Health profile calculation rules

- BMR uses the Mifflin-St Jeor equation.
- Activity multipliers are `1.2`, `1.375`, `1.55`, `1.725` and `1.9`.
- Calories use `TDEE × 0.85` for weight loss, `TDEE` for maintenance and `TDEE × 1.10` for weight gain.
- Protein uses `2.0 g/kg` for weight loss or gain and `1.6 g/kg` for maintenance.
- Fat uses 25% of target calories; carbohydrates use the remaining calories.
