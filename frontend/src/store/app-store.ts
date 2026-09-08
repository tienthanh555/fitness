import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MealType } from '@/types'

interface AppState {
  accessToken:string|null; sidebarCollapsed:boolean; mobileOpen:boolean; theme:'light'|'dark'; water:number; activeMeal:MealType;
  setAccessToken:(token:string|null)=>void; toggleSidebar:()=>void; setMobileOpen:(value:boolean)=>void; toggleTheme:()=>void; addWater:(amount:number)=>void; setActiveMeal:(meal:MealType)=>void;
}
export const useAppStore = create<AppState>()(persist((set)=>({
  accessToken:'demo-access-token',sidebarCollapsed:false,mobileOpen:false,theme:'light',water:1600,activeMeal:'Breakfast',
  setAccessToken:(accessToken)=>set({accessToken}),toggleSidebar:()=>set(s=>({sidebarCollapsed:!s.sidebarCollapsed})),setMobileOpen:(mobileOpen)=>set({mobileOpen}),
  toggleTheme:()=>set(s=>({theme:s.theme==='light'?'dark':'light'})),addWater:(amount)=>set(s=>({water:Math.min(5000,s.water+amount)})),setActiveMeal:(activeMeal)=>set({activeMeal}),
}),{name:'nessfit-ui',partialize:(s)=>({theme:s.theme,water:s.water,sidebarCollapsed:s.sidebarCollapsed})}))

