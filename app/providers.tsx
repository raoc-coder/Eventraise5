'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Toaster } from 'react-hot-toast'
import { CurrencyProvider } from '@/app/providers/currency-provider'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!sharedSupabase) {
      console.error('Missing Supabase environment variables')
      setLoading(false)
      return
    }
    setSupabase(sharedSupabase)
  }, [])

  useEffect(() => {
    if (!supabase) return

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error('Failed to get user:', error)
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      // Clear user state immediately
      setUser(null)
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      <CurrencyProvider>
        {children}
        <Toaster position="top-right" />
      </CurrencyProvider>
    </AuthContext.Provider>
  )
}