import { apiClient } from '@/api/client'
import type { FoodSearchResult } from '@/types'
export const authService={login:(payload:{email:string;password:string})=>apiClient.post('/auth/login',payload),logout:()=>apiClient.post('/auth/logout')}
export const userService={profile:()=>apiClient.get('/users/me'),update:(payload:unknown)=>apiClient.patch('/users/me',payload)}
export const nutritionService={today:()=>apiClient.get('/nutrition/today'),targets:()=>apiClient.get('/nutrition/targets')}
export const foodService={search:(query:string)=>apiClient.get<FoodSearchResult[]>('/foods/search',{params:{query}}),detail:(id:string)=>apiClient.get(`/foods/${id}`)}
export const recipeService={list:()=>apiClient.get('/recipes'),create:(payload:unknown)=>apiClient.post('/recipes',payload)}
export const workoutService={plans:()=>apiClient.get('/workouts/plans'),history:()=>apiClient.get('/workouts/history')}
export const progressService={measurements:()=>apiClient.get('/progress'),create:(payload:unknown)=>apiClient.post('/progress',payload)}
export const waterService={today:()=>apiClient.get('/water'),add:(amount:number)=>apiClient.post('/water',{amount})}
export const aiService={send:(message:string)=>apiClient.post('/ai/messages',{message})}
export const notificationService={list:()=>apiClient.get('/notifications'),markRead:(id:string)=>apiClient.patch(`/notifications/${id}`,{read:true})}
