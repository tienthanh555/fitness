import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
export function Logo({compact=false,light=false}:{compact?:boolean;light?:boolean}){return <Link to="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm"><Activity className="h-5 w-5"/></span>{!compact&&<span className={cn('text-xl font-bold tracking-tight',light?'text-white':'text-slate-900 dark:text-white')}>Ness<span className="text-brand-500">Fit</span></span>}</Link>}

