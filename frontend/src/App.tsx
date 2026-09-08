import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes/AppRoutes'
import { PageSkeleton } from '@/components/common'
export default function App(){return <Suspense fallback={<div className="p-8"><PageSkeleton/></div>}><RouterProvider router={router}/></Suspense>}
