export type UserRole = 'user' | 'admin'
export interface User { id:string; name:string; email:string; avatar?:string; role:UserRole; status:'active'|'suspended'; joinedAt:string }
export interface UserProfile { gender:'male'|'female'|'other'; birthDate:string; height:number; weight:number; activityLevel:string }
export interface UserGoal { type:'lose'|'maintain'|'gain'; targetWeight:number; targetDate:string }
export interface BodyMeasurement { id:string; date:string; weight:number; waist?:number; chest?:number; hip?:number; bodyFat?:number }
export interface NutritionTarget { calories:number; protein:number; carbs:number; fat:number; bmr:number; tdee:number }
export interface Nutrients { calories:number; protein:number; carbs:number; fat:number; fiber?:number; sugar?:number; sodium?:number }
export interface FoodSearchResult extends Nutrients { id:string; name:string; brand?:string; source:'USDA'|'Open Food Facts'; serving:number }
export interface FoodLogItem { id:string; foodName:string; quantity:number; unit:string; meal:MealType; nutrients:Nutrients }
export type MealType = 'Breakfast'|'Lunch'|'Dinner'|'Snacks'
export interface FoodLog { id:string; date:string; items:FoodLogItem[] }
export interface SavedFood extends FoodSearchResult { savedAt:string }
export interface RecipeIngredient { id:string; name:string; quantity:number; unit:string; nutrients:Nutrients }
export interface Recipe { id:string; name:string; description:string; servings:number; image?:string; ingredients:RecipeIngredient[]; total:Nutrients; prepTime:number }
export interface Exercise { id:string; name:string; muscle:string; equipment:string; difficulty:'Beginner'|'Intermediate'|'Advanced'; instructions:string[]; tips:string[]; calories?:number; image?:string }
export interface WorkoutPlanExercise { id:string; exercise:Exercise; sets:number; reps:number; rest:number }
export interface WorkoutPlan { id:string; name:string; goal:string; description:string; sessionsPerWeek:number; active:boolean; exercises:WorkoutPlanExercise[] }
export interface WorkoutSet { id:string; weight:number; reps:number; completed:boolean }
export interface WorkoutSessionExercise { exercise:Exercise; sets:WorkoutSet[] }
export interface WorkoutSession { id:string; planName:string; date:string; duration:number; calories:number; exercises:WorkoutSessionExercise[] }
export interface AIConversation { id:string; title:string; updatedAt:string }
export interface AIMessage { id:string; role:'user'|'assistant'; content:string; createdAt:string }
export interface Notification { id:string; type:'nutrition'|'workout'|'goal'|'streak'|'system'; title:string; message:string; time:string; read:boolean }
export interface UserStreak { current:number; longest:number; activeDays:boolean[] }

