import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { isOwnerAdminUser } from '@/lib/auth-utils'
import { AdminConsoleNav } from '@/components/admin/AdminConsoleNav'
import { Navigation } from '@/components/layout/navigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!isOwnerAdminUser(user)) {
    redirect('/access-denied?scope=admin')
  }

  return (
    <>
      <Navigation />
      <AdminConsoleNav />
      {children}
    </>
  )
}
