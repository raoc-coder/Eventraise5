import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} EventraiseHub. All rights reserved.</p>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
            <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            <div className="flex items-center gap-3 ml-2">
              <a 
                href="https://www.facebook.com/profile.php?id=61584525567671" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/eventraisehub/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
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


