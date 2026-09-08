import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs:ClassValue[]) => twMerge(clsx(inputs))
export const formatNumber = (value:number, digits=0) => new Intl.NumberFormat('en-US',{ maximumFractionDigits:digits }).format(value)
export const formatDate = (value:string|Date) => new Intl.DateTimeFormat('en-GB',{ day:'2-digit',month:'short',year:'numeric' }).format(new Date(value))
export const percent = (current:number,target:number) => Math.min(100, Math.round((current/target)*100))
export const sum = (items:number[]) => items.reduce((a,b)=>a+b,0)

