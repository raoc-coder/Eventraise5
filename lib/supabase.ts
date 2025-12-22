import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase-indigo-lamp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if we have the required keys
if (!supabaseAnonKey && typeof window !== 'undefined') {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Authentication will not work.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const supabaseAdmin = supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null
