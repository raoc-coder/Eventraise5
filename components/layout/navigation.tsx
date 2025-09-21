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
    <nav className={`bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                EventraiseHub
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
                Events
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
                Campaigns
              </Button>
            </Link>
            
            {showAuth && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="text-cyan-400 hover:text-white hover:bg-cyan-500/20"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
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
