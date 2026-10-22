package com.projectd.nessfit;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.json.JsonMapper;

import com.projectd.nessfit.auth.domain.AppUser;
import com.projectd.nessfit.auth.domain.Role;
import com.projectd.nessfit.auth.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AuthApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registrationRefreshAndAuthenticatedProfileWorkTogether() throws Exception {
        String email = "member-" + Instant.now().toEpochMilli() + "@example.com";
        String payload = jsonMapper.writeValueAsString(new RegistrationPayload("Integration Member", email, "Member123"));

        String registrationBody = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.data.user.role").value("USER"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String accessToken = jsonMapper.readTree(registrationBody).path("data").path("accessToken").asText();
        Cookie refreshCookie = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new LoginPayload(email, "Member123"))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("refresh_token");

        assertThat(accessToken).isNotBlank();
        assertThat(refreshCookie).isNotNull();

        mockMvc.perform(get("/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));

        mockMvc.perform(post("/auth/refresh").cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    void accountLocksOnTheEighthFailedLoginAttempt() throws Exception {
        String email = "locked-" + Instant.now().toEpochMilli() + "@example.com";
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new RegistrationPayload("Locked Member", email, "Member123"))))
                .andExpect(status().isCreated());

        String incorrectLogin = jsonMapper.writeValueAsString(new LoginPayload(email, "incorrect"));
        for (int attempt = 1; attempt <= 7; attempt++) {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(incorrectLogin))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("AUTHENTICATION_FAILED"));
        }

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incorrectLogin))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value("ACCOUNT_LOCKED"));
    }

    @Test
    void administratorCanListUsersWithoutASearchQuery() throws Exception {
        String email = "admin-" + Instant.now().toEpochMilli() + "@example.com";
        userRepository.save(new AppUser(email, "Test Administrator", passwordEncoder.encode("AdminPass1"), Role.ADMIN));

        String loginBody = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new LoginPayload(email, "AdminPass1"))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String accessToken = jsonMapper.readTree(loginBody).path("data").path("accessToken").asText();

        mockMvc.perform(get("/admin/users").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void onboardingPersistsProfileTargetsAndInitialWeightHistory() throws Exception {
        String email = "health-" + Instant.now().toEpochMilli() + "@example.com";
        String registrationBody = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new RegistrationPayload("Health Member", email, "Member123"))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String accessToken = jsonMapper.readTree(registrationBody).path("data").path("accessToken").asText();

        String onboarding = jsonMapper.writeValueAsString(new OnboardingPayload(
                "MALE", LocalDate.of(1995, 5, 18), 180, 80, "MODERATELY_ACTIVE", "LOSE_WEIGHT", 72));
        mockMvc.perform(put("/users/me/onboarding")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(onboarding))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.gender").value("MALE"))
                .andExpect(jsonPath("$.data.onboardingCompleted").value(true))
                .andExpect(jsonPath("$.data.bmi").isNumber())
                .andExpect(jsonPath("$.data.nutritionTarget.calories").isNumber())
                .andExpect(jsonPath("$.data.nutritionTarget.proteinGrams").value(160.0));

        mockMvc.perform(get("/users/me/nutrition-targets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fatGrams").isNumber());
        mockMvc.perform(get("/users/me/weight-history")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void measurementsAndDashboardSummaryUseRealUserData() throws Exception {
        String email = "dashboard-" + Instant.now().toEpochMilli() + "@example.com";
        String registrationBody = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new RegistrationPayload("Dashboard Member", email, "Member123"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String accessToken = jsonMapper.readTree(registrationBody).path("data").path("accessToken").asText();
        mockMvc.perform(put("/users/me/onboarding")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new OnboardingPayload(
                                "MALE", LocalDate.of(1995, 5, 18), 180, 80, "MODERATELY_ACTIVE", "LOSE_WEIGHT", 72))))
                .andExpect(status().isOk());

        LocalDate earlierDate = LocalDate.now().minusDays(1);
        String created = mockMvc.perform(post("/users/me/measurements")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new WeightMeasurementPayload(79, earlierDate))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.weightKg").value(79.0))
                .andReturn().getResponse().getContentAsString();
        String measurementId = jsonMapper.readTree(created).path("data").path("id").asText();

        mockMvc.perform(get("/dashboard/summary?date=" + LocalDate.now())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentWeightKg").value(80.0))
                .andExpect(jsonPath("$.data.startingWeightKg").value(79.0))
                .andExpect(jsonPath("$.data.calorieHistory.length()").value(7))
                .andExpect(jsonPath("$.data.weightHistory.length()").value(2));

        mockMvc.perform(put("/users/me/measurements/" + measurementId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new WeightMeasurementPayload(78.5, earlierDate))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.weightKg").value(78.5));
        mockMvc.perform(delete("/users/me/measurements/" + measurementId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/users/me/weight-history")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void foodSearchDiarySummaryAndSavedFoodsUseGramBasedSnapshots() throws Exception {
        String email = "food-" + Instant.now().toEpochMilli() + "@example.com";
        String registrationBody = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new RegistrationPayload("Food Member", email, "Member123"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String accessToken = jsonMapper.readTree(registrationBody).path("data").path("accessToken").asText();
        String searchBody = mockMvc.perform(get("/foods/search?query=Chicken")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].name").value("Chicken Breast, Roasted"))
                .andReturn().getResponse().getContentAsString();
        String foodId = jsonMapper.readTree(searchBody).path("data").path("content").get(0).path("id").asText();

        String diaryPayload = jsonMapper.writeValueAsString(new DiaryPayload(foodId, LocalDate.now(), "BREAKFAST", 200));
        String diaryBody = mockMvc.perform(post("/nutrition/diary/items")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON).content(diaryPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.quantityGrams").value(200.0))
                .andExpect(jsonPath("$.data.calories").value(330.0))
                .andExpect(jsonPath("$.data.proteinGrams").value(62.0))
                .andReturn().getResponse().getContentAsString();
        String diaryItemId = jsonMapper.readTree(diaryBody).path("data").path("id").asText();
        String riceId = "10000000-0000-0000-0000-000000000002";
        mockMvc.perform(put("/nutrition/diary/items/" + diaryItemId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new DiaryPayload(riceId, LocalDate.now(), "BREAKFAST", 100))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.foodId").value(riceId))
                .andExpect(jsonPath("$.data.foodName").value("White Rice, Cooked"))
                .andExpect(jsonPath("$.data.calories").value(130.0));

        mockMvc.perform(get("/nutrition/summary?date=" + LocalDate.now())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.calories").value(130.0))
                .andExpect(jsonPath("$.data.meals[0].mealType").value("BREAKFAST"));

        mockMvc.perform(post("/users/me/saved-foods/" + foodId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Chicken Breast, Roasted"));
        mockMvc.perform(get("/users/me/saved-foods")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(1));
        mockMvc.perform(delete("/users/me/saved-foods/" + foodId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    void administratorCanCreateUpdateAndDeactivateFoods() throws Exception {
        String email = "food-admin-" + Instant.now().toEpochMilli() + "@example.com";
        userRepository.save(new AppUser(email, "Food Administrator", passwordEncoder.encode("AdminPass1"), Role.ADMIN));
        String loginBody = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new LoginPayload(email, "AdminPass1"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String accessToken = jsonMapper.readTree(loginBody).path("data").path("accessToken").asText();

        mockMvc.perform(get("/admin/foods").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(15));
        String createBody = jsonMapper.writeValueAsString(new FoodPayload("Test Food", 100, 10, 20, 2, 3, 4, 5, true));
        String created = mockMvc.perform(post("/admin/foods").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.name").value("Test Food"))
                .andReturn().getResponse().getContentAsString();
        String foodId = jsonMapper.readTree(created).path("data").path("id").asText();
        mockMvc.perform(put("/admin/foods/" + foodId).header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(new FoodPayload("Updated Test Food", 110, 11, 21, 3, 4, 5, 6, true))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("Updated Test Food"));
        mockMvc.perform(delete("/admin/foods/" + foodId).header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    private record RegistrationPayload(String fullName, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }

    private record OnboardingPayload(String gender, LocalDate dateOfBirth, double heightCm,
            double currentWeightKg, String activityLevel, String goal, double targetWeightKg) {
    }

    private record DiaryPayload(String foodId, LocalDate logDate, String mealType, double quantityGrams) {
    }

    private record WeightMeasurementPayload(double weightKg, LocalDate measuredAt) {
    }

    private record FoodPayload(String name, double caloriesPer100g, double proteinPer100g,
            double carbohydratesPer100g, double fatPer100g, double fiberPer100g,
            double sugarPer100g, double sodiumMgPer100g, boolean active) {
    }
}
