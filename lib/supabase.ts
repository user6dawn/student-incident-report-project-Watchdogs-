import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local (or .env) and restart the dev server.'
  )
}

// Basic format check to help catch copy/paste mistakes
if (!/^https:\/\/.+\.supabase\.co$/.test(supabaseUrl)) {
  // eslint-disable-next-line no-console
  console.warn(
    `Unexpected NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}. It should look like https://xxxx.supabase.co`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Student {
  id: string
  name: string
  email: string
  department: string | null
  image_url: string | null
  role: 'student' | 'admin'
  created_at: string
}

export interface Report {
  id: string
  student_id: string
  anonymous?: boolean
  type: string
  date: string
  location: string
  latitude?: number | null
  longitude?: number | null
  description: string
  image_url: string | null
  status: 'new' | 'resolved' | 'unresolved'
  created_at: string
  students?: Student
}
