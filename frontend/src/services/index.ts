import { apiClient } from '@/api/client'
import type { ApiEnvelope, AuthSession, AuthUserPayload } from '@/api/client'
import type { FoodSearchResult } from '@/types'
import type { AxiosResponse } from 'axios'

const unwrap=<T>(response:AxiosResponse<ApiEnvelope<T>>)=>response.data.data
export type AuthUser=AuthUserPayload
export interface UserPage{content:AuthUser[];page:number;size:number;totalElements:number;totalPages:number}

export const authService={
 login:(payload:{email:string;password:string})=>apiClient.post<ApiEnvelope<AuthSession>>('/auth/login',payload).then(unwrap),
 register:(payload:{fullName:string;email:string;password:string})=>apiClient.post<ApiEnvelope<AuthSession>>('/auth/register',payload).then(unwrap),
 refresh:()=>apiClient.post<ApiEnvelope<AuthSession>>('/auth/refresh').then(unwrap),
 logout:()=>apiClient.post<ApiEnvelope<{message:string}>>('/auth/logout').then(unwrap),
 logoutAll:()=>apiClient.post<ApiEnvelope<{message:string}>>('/auth/logout-all').then(unwrap),
 forgotPassword:(email:string)=>apiClient.post<ApiEnvelope<{message:string}>>('/auth/forgot-password',{email}).then(unwrap),
}
let restorePromise:Promise<AuthSession>|undefined
export function restoreAuthSession(){if(!restorePromise)restorePromise=authService.refresh();return restorePromise}

export const userService={
 profile:()=>apiClient.get<ApiEnvelope<AuthUser>>('/users/me').then(unwrap),
 update:(payload:{fullName:string;email:string})=>apiClient.put<ApiEnvelope<AuthUser>>('/users/me',payload).then(unwrap),
 changePassword:(payload:{currentPassword:string;newPassword:string})=>apiClient.post<ApiEnvelope<{message:string}>>('/users/me/password',payload).then(unwrap),
 deleteAccount:(password:string)=>apiClient.delete<ApiEnvelope<{message:string}>>('/users/me',{data:{password}}).then(unwrap),
}
export const adminUserService={
 list:(params:{query?:string;status?:string;page?:number;size?:number}={})=>apiClient.get<ApiEnvelope<UserPage>>('/admin/users',{params}).then(unwrap),
 get:(id:string)=>apiClient.get<ApiEnvelope<AuthUser>>(`/admin/users/${id}`).then(unwrap),
 lock:(id:string)=>apiClient.patch<ApiEnvelope<AuthUser>>(`/admin/users/${id}/lock`).then(unwrap),
 unlock:(id:string)=>apiClient.patch<ApiEnvelope<AuthUser>>(`/admin/users/${id}/unlock`).then(unwrap),
 delete:(id:string)=>apiClient.delete<ApiEnvelope<{message:string}>>(`/admin/users/${id}`).then(unwrap),
}
export interface FoodApi{id:string;name:string;caloriesPer100g:number;proteinPer100g:number;carbohydratesPer100g:number;fatPer100g:number;fiberPer100g:number;sugarPer100g:number;sodiumMgPer100g:number;active:boolean;createdAt:string;updatedAt:string}
export interface FoodPage{content:FoodApi[];page:number;size:number;totalElements:number;totalPages:number}
export type MealType='BREAKFAST'|'LUNCH'|'DINNER'
export interface FoodDiaryItemApi{id:string;foodId:string;foodName:string;logDate:string;mealType:MealType;quantityGrams:number;calories:number;proteinGrams:number;carbohydratesGrams:number;fatGrams:number;fiberGrams:number;sugarGrams:number;sodiumMg:number}
export interface NutritionSummary{date:string;calories:number;proteinGrams:number;carbohydratesGrams:number;fatGrams:number;targetCalories:number|null;targetProteinGrams:number|null;targetCarbohydratesGrams:number|null;targetFatGrams:number|null;meals:{mealType:MealType;items:FoodDiaryItemApi[];calories:number;proteinGrams:number;carbohydratesGrams:number;fatGrams:number}[]}
export interface FoodRequest{name:string;caloriesPer100g:number;proteinPer100g:number;carbohydratesPer100g:number;fatPer100g:number;fiberPer100g:number;sugarPer100g:number;sodiumMgPer100g:number;active:boolean}
export const nutritionService={
 diary:(date?:string)=>apiClient.get<ApiEnvelope<FoodDiaryItemApi[]>>('/nutrition/diary',{params:date?{date}:undefined}).then(unwrap),
 summary:(date?:string)=>apiClient.get<ApiEnvelope<NutritionSummary>>('/nutrition/summary',{params:date?{date}:undefined}).then(unwrap),
 addDiaryItem:(payload:{foodId:string;logDate:string;mealType:MealType;quantityGrams:number})=>apiClient.post<ApiEnvelope<FoodDiaryItemApi>>('/nutrition/diary/items',payload).then(unwrap),
 updateDiaryItem:(id:string,payload:{foodId:string;logDate:string;mealType:MealType;quantityGrams:number})=>apiClient.put<ApiEnvelope<FoodDiaryItemApi>>(`/nutrition/diary/items/${id}`,payload).then(unwrap),
 deleteDiaryItem:(id:string)=>apiClient.delete<ApiEnvelope<{message:string}>>(`/nutrition/diary/items/${id}`).then(unwrap),
 targets:()=>apiClient.get<ApiEnvelope<NutritionTarget>>('/users/me/nutrition-targets').then(unwrap),
}
export const foodService={
 search:(params:{query?:string;minProtein?:number;maxCalories?:number;page?:number;size?:number}={})=>apiClient.get<ApiEnvelope<FoodPage>>('/foods/search',{params}).then(unwrap),
 detail:(id:string)=>apiClient.get<ApiEnvelope<FoodApi>>(`/foods/${id}`).then(unwrap),
}
export const savedFoodService={
 list:()=>apiClient.get<ApiEnvelope<FoodApi[]>>('/users/me/saved-foods').then(unwrap),
 save:(foodId:string)=>apiClient.post<ApiEnvelope<FoodApi>>(`/users/me/saved-foods/${foodId}`).then(unwrap),
 remove:(foodId:string)=>apiClient.delete<ApiEnvelope<{message:string}>>(`/users/me/saved-foods/${foodId}`).then(unwrap),
}
export const adminFoodService={
 list:(params:{query?:string;page?:number;size?:number}={})=>apiClient.get<ApiEnvelope<FoodPage>>('/admin/foods',{params}).then(unwrap),
 create:(payload:FoodRequest)=>apiClient.post<ApiEnvelope<FoodApi>>('/admin/foods',payload).then(unwrap),
 update:(id:string,payload:FoodRequest)=>apiClient.put<ApiEnvelope<FoodApi>>(`/admin/foods/${id}`,payload).then(unwrap),
 delete:(id:string)=>apiClient.delete<ApiEnvelope<{message:string}>>(`/admin/foods/${id}`).then(unwrap),
}
export const recipeService={list:()=>apiClient.get('/recipes'),create:(payload:unknown)=>apiClient.post('/recipes',payload)}
export const workoutService={plans:()=>apiClient.get('/workouts/plans'),history:()=>apiClient.get('/workouts/history')}
export const progressService={measurements:()=>apiClient.get('/progress'),create:(payload:unknown)=>apiClient.post('/progress',payload)}
export const aiService={send:(message:string)=>apiClient.post('/ai/messages',{message})}
export const notificationService={list:()=>apiClient.get('/notifications'),markRead:(id:string)=>apiClient.patch(`/notifications/${id}`,{read:true})}

export type HealthGender='MALE'|'FEMALE'
export type ActivityLevel='SEDENTARY'|'LIGHTLY_ACTIVE'|'MODERATELY_ACTIVE'|'VERY_ACTIVE'|'EXTRA_ACTIVE'
export type HealthGoal='LOSE_WEIGHT'|'MAINTAIN_WEIGHT'|'GAIN_WEIGHT'
export interface NutritionTarget{calories:number;proteinGrams:number;carbohydratesGrams:number;fatGrams:number;bmr:number;tdee:number;calculatedAt:string}
export interface HealthProfile{ id:string;gender:HealthGender;dateOfBirth:string;heightCm:number;currentWeightKg:number;activityLevel:ActivityLevel;goal:HealthGoal;targetWeightKg:number|null;onboardingCompleted:boolean;bmi:number;nutritionTarget:NutritionTarget|null }
export interface OnboardingPayload{gender:HealthGender;dateOfBirth:string;heightCm:number;currentWeightKg:number;activityLevel:ActivityLevel;goal:HealthGoal;targetWeightKg:number|null}
export interface WeightMeasurementApi{id:string;measuredAt:string;weightKg:number}
export const healthService={
 completeOnboarding:(payload:OnboardingPayload)=>apiClient.put<ApiEnvelope<HealthProfile>>('/users/me/onboarding',payload).then(unwrap),
 profile:()=>apiClient.get<ApiEnvelope<HealthProfile>>('/users/me/health-profile').then(unwrap),
 targets:()=>apiClient.get<ApiEnvelope<NutritionTarget>>('/users/me/nutrition-targets').then(unwrap),
 recalculate:()=>apiClient.post<ApiEnvelope<NutritionTarget>>('/users/me/nutrition-targets/recalculate').then(unwrap),
 weightHistory:(params:{from?:string;to?:string}={})=>apiClient.get<ApiEnvelope<WeightMeasurementApi[]>>('/users/me/weight-history',{params}).then(unwrap),
 createMeasurement:(payload:{weightKg:number;measuredAt:string})=>apiClient.post<ApiEnvelope<WeightMeasurementApi>>('/users/me/measurements',payload).then(unwrap),
 updateMeasurement:(id:string,payload:{weightKg:number;measuredAt:string})=>apiClient.put<ApiEnvelope<WeightMeasurementApi>>(`/users/me/measurements/${id}`,payload).then(unwrap),
 deleteMeasurement:(id:string)=>apiClient.delete<ApiEnvelope<{message:string}>>(`/users/me/measurements/${id}`).then(unwrap),
}
export interface DashboardDailyNutrition{date:string;calories:number;targetCalories:number|null}
export interface DashboardSummary{date:string;nutrition:NutritionSummary;calorieHistory:DashboardDailyNutrition[];weightHistory:WeightMeasurementApi[];currentWeightKg:number;startingWeightKg:number;targetWeightKg:number|null;weightChangeKg:number;goal:HealthGoal}
export const dashboardService={
 summary:(date?:string)=>apiClient.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary',{params:date?{date}:undefined}).then(unwrap),
}
