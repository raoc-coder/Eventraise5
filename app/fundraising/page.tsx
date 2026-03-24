import Link from 'next/link'
import { PSEO_PAGE_COUNT } from '@/lib/pseo/us-fundraising-pages'

export default function FundraisingHubPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Local Fundraising in the U.S.</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Explore localized fundraising guides for schools, nonprofits, volunteer-run organizations, faith communities,
        and community groups. EventraiseHub programmatically publishes {PSEO_PAGE_COUNT.toLocaleString()} pages for
        location-specific fundraising planning.
      </p>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Get started</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Jump straight into creating your event, donation page, ticketing, and volunteer operations.
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href="/events/create"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Create event
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            Browse events
          </Link>
        </div>
      </div>
    </main>
  )
}
