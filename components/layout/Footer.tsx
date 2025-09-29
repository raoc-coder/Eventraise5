import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} EventraiseHub. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="/events" className="hover:text-gray-900">Events</a>
            <a href="/marketplace" className="hover:text-gray-900">Discover</a>
            <a href="/auth/login" className="hover:text-gray-900">Login</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


