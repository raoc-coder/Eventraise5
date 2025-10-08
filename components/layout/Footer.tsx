import React from 'react'
import Link from 'next/link'

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
          </nav>
        </div>
      </div>
    </footer>
  )
}


