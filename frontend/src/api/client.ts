import axios from 'axios'
import { useAppStore } from '@/store/app-store'

export const apiClient = axios.create({baseURL:import.meta.env.VITE_API_URL ?? '/api',withCredentials:true,timeout:15000})
apiClient.interceptors.request.use((config)=>{const token=useAppStore.getState().accessToken;if(token) config.headers.Authorization=`Bearer ${token}`;return config})
apiClient.interceptors.response.use((response)=>response,async(error)=>{
  const original=error.config
  if(error.response?.status===401 && !original?._retry){original._retry=true;try{const {data}=await apiClient.post<{accessToken:string}>('/auth/refresh');useAppStore.getState().setAccessToken(data.accessToken);original.headers.Authorization=`Bearer ${data.accessToken}`;return apiClient(original)}catch{useAppStore.getState().setAccessToken(null)}}
  return Promise.reject(error)
})

