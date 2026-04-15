import Link from 'next/link'

const adminLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/payouts/events', label: 'Event Payouts' },
  { href: '/admin/payouts', label: 'Donation Payouts' },
]

export function AdminConsoleNav() {
  return (
    <div className="border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
