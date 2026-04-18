import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-trust-100 bg-gradient-to-b from-trust-50/90 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <p className="text-sm text-trust-700">© {new Date().getFullYear()} EventraiseHub. All rights reserved.</p>
            <p className="text-xs text-trust-600 leading-snug max-w-md">
              Portfolio company of On the M.A.R.C. Holdings LLC
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/legal/terms" className="text-trust-700 hover:text-trust-950 transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="text-trust-700 hover:text-trust-950 transition-colors">Privacy</Link>
            <Link href="/contact" className="text-trust-700 hover:text-trust-950 transition-colors">Contact</Link>
            <div className="flex items-center gap-3 ml-2">
              <a 
                href="https://www.facebook.com/profile.php?id=61584525567671" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-trust-600 hover:text-trust-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/eventraisehub/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-trust-600 hover:text-action-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
}


