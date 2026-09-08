import { lazy, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'
import { AuthLayout } from '@/layouts/AuthLayout'
import { useAppStore } from '@/store/app-store'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/pages/system/SystemPages'

const LandingPage=lazy(()=>import('@/pages/public/LandingPage').then(m=>({default:m.LandingPage})))
const LoginPage=lazy(()=>import('@/pages/auth/AuthPages').then(m=>({default:m.LoginPage})))
const RegisterPage=lazy(()=>import('@/pages/auth/AuthPages').then(m=>({default:m.RegisterPage})))
const ForgotPasswordPage=lazy(()=>import('@/pages/auth/AuthPages').then(m=>({default:m.ForgotPasswordPage})))
const ResetPasswordPage=lazy(()=>import('@/pages/auth/AuthPages').then(m=>({default:m.ResetPasswordPage})))
const OnboardingPage=lazy(()=>import('@/pages/onboarding/OnboardingPage').then(m=>({default:m.OnboardingPage})))
const DashboardPage=lazy(()=>import('@/pages/dashboard/DashboardPage').then(m=>({default:m.DashboardPage})))
const FoodSearchPage=lazy(()=>import('@/pages/nutrition/NutritionPages').then(m=>({default:m.FoodSearchPage})))
const FoodDetailPage=lazy(()=>import('@/pages/nutrition/NutritionPages').then(m=>({default:m.FoodDetailPage})))
const FoodDiaryPage=lazy(()=>import('@/pages/nutrition/NutritionPages').then(m=>({default:m.FoodDiaryPage})))
const SavedFoodsPage=lazy(()=>import('@/pages/nutrition/NutritionPages').then(m=>({default:m.SavedFoodsPage})))
const NutritionTargetsPage=lazy(()=>import('@/pages/nutrition/NutritionPages').then(m=>({default:m.NutritionTargetsPage})))
const RecipesPage=lazy(()=>import('@/pages/recipes/RecipePages').then(m=>({default:m.RecipesPage})))
const RecipeDetailPage=lazy(()=>import('@/pages/recipes/RecipePages').then(m=>({default:m.RecipeDetailPage})))
const CreateRecipePage=lazy(()=>import('@/pages/recipes/RecipePages').then(m=>({default:m.CreateRecipePage})))
const ProgressPage=lazy(()=>import('@/pages/progress/ProgressPages').then(m=>({default:m.ProgressPage})))
const WaterPage=lazy(()=>import('@/pages/water/WaterPage').then(m=>({default:m.WaterPage})))
const ExerciseLibraryPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.ExerciseLibraryPage})))
const ExerciseDetailPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.ExerciseDetailPage})))
const WorkoutPlansPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.WorkoutPlansPage})))
const CreateWorkoutPlanPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.CreateWorkoutPlanPage})))
const WorkoutSessionPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.WorkoutSessionPage})))
const WorkoutHistoryPage=lazy(()=>import('@/pages/workouts/WorkoutPages').then(m=>({default:m.WorkoutHistoryPage})))
const AIPage=lazy(()=>import('@/pages/ai/AIPage').then(m=>({default:m.AIPage})))
const NotificationsPage=lazy(()=>import('@/pages/account/AccountPages').then(m=>({default:m.NotificationsPage})))
const ProfilePage=lazy(()=>import('@/pages/account/AccountPages').then(m=>({default:m.ProfilePage})))
const SettingsPage=lazy(()=>import('@/pages/account/AccountPages').then(m=>({default:m.SettingsPage})))
const AdminDashboardPage=lazy(()=>import('@/pages/admin/AdminPages').then(m=>({default:m.AdminDashboardPage})))
const AdminUsersPage=lazy(()=>import('@/pages/admin/AdminPages').then(m=>({default:m.AdminUsersPage})))
const AdminExercisesPage=lazy(()=>import('@/pages/admin/AdminPages').then(m=>({default:m.AdminExercisesPage})))

function ProtectedRoute({children}:{children:ReactNode}){const token=useAppStore.getState().accessToken;return token?children:<Navigate to="/login" replace/>}
function AdminRoute({children}:{children:ReactNode}){const token=useAppStore.getState().accessToken;const demoRole='admin';if(!token)return <Navigate to="/login" replace/>;return demoRole==='admin'?children:<Navigate to="/forbidden" replace/>}

export const router=createBrowserRouter([
 {path:'/',element:<LandingPage/>,errorElement:<ErrorPage/>},
 {element:<AuthLayout/>,children:[{path:'/login',element:<LoginPage/>},{path:'/register',element:<RegisterPage/>},{path:'/forgot-password',element:<ForgotPasswordPage/>},{path:'/reset-password',element:<ResetPasswordPage/>}]},
 {path:'/onboarding',element:<OnboardingPage/>},
 {element:<ProtectedRoute><AppShell/></ProtectedRoute>,errorElement:<ErrorPage/>,children:[
  {path:'/dashboard',element:<DashboardPage/>},
  {path:'/nutrition/search',element:<FoodSearchPage/>},{path:'/nutrition/food/:id',element:<FoodDetailPage/>},{path:'/nutrition/diary',element:<FoodDiaryPage/>},{path:'/nutrition/saved',element:<SavedFoodsPage/>},{path:'/nutrition/targets',element:<NutritionTargetsPage/>},
  {path:'/recipes',element:<RecipesPage/>},{path:'/recipes/create',element:<CreateRecipePage/>},{path:'/recipes/:id',element:<RecipeDetailPage/>},
  {path:'/progress',element:<ProgressPage/>},{path:'/water',element:<WaterPage/>},
  {path:'/workouts/exercises',element:<ExerciseLibraryPage/>},{path:'/workouts/exercises/:id',element:<ExerciseDetailPage/>},{path:'/workouts/plans',element:<WorkoutPlansPage/>},{path:'/workouts/plans/create',element:<CreateWorkoutPlanPage/>},{path:'/workouts/session/:id',element:<WorkoutSessionPage/>},{path:'/workouts/history',element:<WorkoutHistoryPage/>},
  {path:'/ai',element:<AIPage/>},{path:'/notifications',element:<NotificationsPage/>},{path:'/profile',element:<ProfilePage/>},{path:'/settings',element:<SettingsPage/>},
 ]},
 {element:<AdminRoute><AdminShell/></AdminRoute>,children:[{path:'/admin',element:<AdminDashboardPage/>},{path:'/admin/users',element:<AdminUsersPage/>},{path:'/admin/exercises',element:<AdminExercisesPage/>}]},
 {path:'/forbidden',element:<ForbiddenPage/>},{path:'/not-found',element:<NotFoundPage/>},{path:'*',element:<NotFoundPage/>},
])
