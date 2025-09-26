'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Menu, X } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { useState } from 'react'

interface NavigationProps {
  showAuth?: boolean
  className?: string
}

export function Navigation({ showAuth = true, className = '' }: NavigationProps) {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur supports-[backdrop-filter]:backdrop-saturate-150 shadow-sm w-full overflow-hidden ${className}`}>
      <div className="nav-container w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 min-h-[64px]">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-blue-600 flex-shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                EventraiseHUB
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                Events
              </Button>
            </Link>
            <Link href="/events/mine">
              <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                My Events
              </Button>
            </Link>
            
            {showAuth && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={signOut}
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" className="btn-primary shadow-[var(--shadow-button)]">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5 min-w-[44px] min-h-[44px]"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/events" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                  Events
                </Button>
              </Link>
              <Link href="/events/mine" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                  My Events
                </Button>
              </Link>
              
              {showAuth && (
                <>
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          signOut()
                          closeMobileMenu()
                        }}
                        className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={closeMobileMenu}>
                        <Button className="w-full justify-start btn-primary shadow-[var(--shadow-button)]">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
