import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MealType } from '@/types'

export type AuthRole = 'USER'|'ADMIN'
export interface AuthUser { id:string; fullName:string; email:string; role:AuthRole; status:'ACTIVE'|'LOCKED'|'DELETED'; createdAt:string }

interface AppState {
  accessToken:string|null; authUser:AuthUser|null; authReady:boolean; onboardingCompleted:boolean|null; sidebarCollapsed:boolean; mobileOpen:boolean; theme:'light'|'dark'; activeMeal:MealType;
  setAuth:(accessToken:string,user:AuthUser)=>void; clearAuth:()=>void; setAuthReady:(value:boolean)=>void; setOnboardingCompleted:(value:boolean|null)=>void; toggleSidebar:()=>void; setMobileOpen:(value:boolean)=>void; toggleTheme:()=>void; setActiveMeal:(meal:MealType)=>void;
}
export const useAppStore = create<AppState>()(persist((set)=>({
  accessToken:null,authUser:null,authReady:false,onboardingCompleted:null,sidebarCollapsed:false,mobileOpen:false,theme:'light',activeMeal:'Breakfast',
  setAuth:(accessToken,authUser)=>set({accessToken,authUser}),clearAuth:()=>set({accessToken:null,authUser:null,onboardingCompleted:null}),setAuthReady:(authReady)=>set({authReady}),setOnboardingCompleted:(onboardingCompleted)=>set({onboardingCompleted}),toggleSidebar:()=>set(s=>({sidebarCollapsed:!s.sidebarCollapsed})),setMobileOpen:(mobileOpen)=>set({mobileOpen}),
  toggleTheme:()=>set(s=>({theme:s.theme==='light'?'dark':'light'})),setActiveMeal:(activeMeal)=>set({activeMeal}),
}),{name:'nessfit-ui',partialize:(s)=>({theme:s.theme,sidebarCollapsed:s.sidebarCollapsed})}))

