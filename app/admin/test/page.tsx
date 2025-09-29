'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminTestPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...')
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 User:', user)
      
      if (!user) {
        console.log('❌ No user found, redirecting to login')
        router.push('/auth/login')
        return
      }
      
      console.log('✅ User found:', user.email)
      console.log('📊 User metadata:', user.user_metadata)
      console.log('📊 App metadata:', user.app_metadata)
      
      setUser(user)
      setLoading(false)
    }
    
    checkAuth()
  }, [router, supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="space-y-2">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>User Metadata:</strong> {JSON.stringify(user?.user_metadata, null, 2)}</p>
        <p><strong>App Metadata:</strong> {JSON.stringify(user?.app_metadata, null, 2)}</p>
      </div>
      <div className="mt-4">
        <a href="/admin/payouts" className="bg-blue-500 text-white px-4 py-2 rounded">
          Go to Payouts
        </a>
      </div>
    </div>
  )
}
