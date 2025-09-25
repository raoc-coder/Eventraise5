'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useAuth } from '@/app/providers'

interface NavigationProps {
  showAuth?: boolean
  className?: string
}

export function Navigation({ showAuth = true, className = '' }: NavigationProps) {
  const { user, signOut } = useAuth()

  return (
    <nav className={`sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur supports-[backdrop-filter]:backdrop-saturate-150 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-blue-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                EventraiseHUB
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                Events
              </Button>
            </Link>
            {/* Pricing removed: single transparent fee */}
            
            {showAuth && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="btn-primary shadow-[var(--shadow-button)]">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
