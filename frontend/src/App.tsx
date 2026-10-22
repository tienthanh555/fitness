import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes/AppRoutes'
import { PageSkeleton } from '@/components/common'
import axios from 'axios'
import { healthService, restoreAuthSession } from '@/services'
import { useAppStore } from '@/store/app-store'

export default function App(){
 const authReady=useAppStore(s=>s.authReady)
 const setAuth=useAppStore(s=>s.setAuth)
 const clearAuth=useAppStore(s=>s.clearAuth)
 const setAuthReady=useAppStore(s=>s.setAuthReady)
 const accessToken=useAppStore(s=>s.accessToken)
 const authUser=useAppStore(s=>s.authUser)
 const setOnboardingCompleted=useAppStore(s=>s.setOnboardingCompleted)
 useEffect(()=>{let active=true;restoreAuthSession().then(session=>{if(active)setAuth(session.accessToken,session.user)}).catch(()=>{if(active)clearAuth()}).finally(()=>{if(active)setAuthReady(true)});return()=>{active=false}},[clearAuth,setAuth,setAuthReady])
 useEffect(()=>{if(!authReady||!accessToken||!authUser)return;let active=true;if(authUser.role==='ADMIN'){setOnboardingCompleted(true);return()=>{active=false}};healthService.profile().then(()=>{if(active)setOnboardingCompleted(true)}).catch(error=>{if(!active)return;if(axios.isAxiosError(error)&&error.response?.status===404)setOnboardingCompleted(false)});return()=>{active=false}},[accessToken,authReady,authUser,setOnboardingCompleted])
 if(!authReady)return <div className="p-8"><PageSkeleton/></div>
 return <Suspense fallback={<div className="p-8"><PageSkeleton/></div>}><RouterProvider router={router}/></Suspense>
}
