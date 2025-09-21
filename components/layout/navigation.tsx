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
    <nav className={`bg-white border-b border-gray-200 relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Event Raise
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                Events
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                Campaigns
              </Button>
            </Link>
            
            {showAuth && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="btn-primary">
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
