import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} EventraiseHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


