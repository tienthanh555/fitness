import { AlertTriangle, ArrowLeft, Home, LockKeyhole, SearchX } from 'lucide-react'
import { Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui'

export function NotFoundPage(){return <SystemState code="404" icon={SearchX} title="This page took a rest day" text="The page you're looking for doesn't exist or has moved."/>}
export function ForbiddenPage(){return <SystemState code="403" icon={LockKeyhole} title="You don't have access" text="This area requires a different NessFit role or permission."/>}
export function ErrorPage(){const error=useRouteError();console.error(error);return <SystemState code="500" icon={AlertTriangle} title="NessFit hit an unexpected snag" text="Your data is safe. Refresh the page or return to your dashboard."/>}
function SystemState({code,icon:Icon,title,text}:{code:string;icon:typeof SearchX;title:string;text:string}){return <div className="grid min-h-screen place-items-center bg-canvas p-5"><div className="max-w-md text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-8 w-8"/></span><p className="mt-6 text-sm font-bold text-brand-600">ERROR {code}</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-3 text-slate-500">{text}</p><div className="mt-7 flex justify-center gap-2"><Button variant="secondary" onClick={()=>history.back()}><ArrowLeft className="h-4 w-4"/>Go back</Button><Link to="/dashboard"><Button><Home className="h-4 w-4"/>Dashboard</Button></Link></div></div></div>}
