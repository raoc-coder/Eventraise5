'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Menu, X } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { useState } from 'react'
import Image from 'next/image'

interface NavigationProps {
  showAuth?: boolean
  className?: string
}

export function Navigation({ showAuth = true, className = '' }: NavigationProps) {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const envLogoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || ''
  const initialVariant: 'env' | 'png' | 'svg' | 'icon' = envLogoUrl ? 'env' : 'png'
  const [logoVariant, setLogoVariant] = useState<'env' | 'png' | 'svg' | 'icon'>(initialVariant)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const renderLogo = () => {
    if (logoVariant === 'icon') {
      return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 ring-2 ring-blue-100 shadow-md flex-shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
      )
    }
    const src = logoVariant === 'env' ? envLogoUrl : logoVariant === 'png' ? '/brand/logo.png' : '/brand/logo.svg'
    return (
      <Image
        src={src}
        alt="EventraiseHub logo"
        width={36}
        height={36}
        className="w-9 h-9 rounded-md ring-2 ring-blue-100 shadow-md object-contain bg-white"
        onError={() => setLogoVariant(logoVariant === 'env' ? 'png' : logoVariant === 'png' ? 'svg' : 'icon')}
        priority
      />
    )
  }

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur supports-[backdrop-filter]:backdrop-saturate-150 shadow-sm w-full overflow-hidden ${className}`}>
      <div className="nav-container w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 min-h-[64px] sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              {renderLogo()}
              <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 tracking-tight truncate">
                EventraiseHub
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5">
            <Link href="/faqs">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                FAQs
              </Button>
            </Link>
            <Link href="/getting-started">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Getting Started
              </Button>
            </Link>
            {user && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Button>
              </Link>
            )}
            <Link href="/events/mine">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                My Events
              </Button>
            </Link>
            {user && (
              <Link href="/organizer/payouts">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  My Payouts
                </Button>
              </Link>
            )}
            {user && (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') && (
              <Link href="/admin/payouts/events">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Admin Payouts
                </Button>
              </Link>
            )}
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Events
              </Button>
            </Link>
            
            {showAuth && (
              <>
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={signOut}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">
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
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-w-[44px] min-h-[44px]"
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
          <div className="md:hidden border-t border-gray-200 bg-white backdrop-blur">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link href="/faqs" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                  FAQs
                </Button>
              </Link>
              <Link href="/getting-started" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                  Getting Started
                </Button>
              </Link>
              {user && (
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/events/mine" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                  My Events
                </Button>
              </Link>
              {user && (
                <Link href="/organizer/payouts" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                    My Payouts
                  </Button>
                </Link>
              )}
              {user && (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') && (
                <Link href="/admin/payouts/events" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                    Admin Payouts
                  </Button>
                </Link>
              )}
              <Link href="/events" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                  Events
                </Button>
              </Link>
              
              {showAuth && (
                <>
                  {user ? (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          signOut()
                          closeMobileMenu()
                        }}
                        className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 text-base">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={closeMobileMenu}>
                        <Button className="w-full justify-start">
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
