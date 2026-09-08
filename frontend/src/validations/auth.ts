import { z } from 'zod'
export const emailSchema=z.string().trim().email('Enter a valid email address')
export const passwordSchema=z.string().min(8,'Password must be at least 8 characters')
export const profileSchema=z.object({name:z.string().min(2),height:z.coerce.number().min(100).max(250),weight:z.coerce.number().min(30).max(400)})
