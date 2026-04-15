import Link from 'next/link'
import {
  FUNDRAISING_TOPICS,
  ORGANIZATION_TYPES,
  PSEO_PAGE_COUNT,
  US_STATE_CAPITAL_SEEDS,
} from '@/lib/pseo/us-fundraising-pages'

export default function FundraisingHubPage() {
  const featuredStates = US_STATE_CAPITAL_SEEDS.slice(0, 8)
  const featuredOrgTypes = ORGANIZATION_TYPES.slice(0, 5)
  const featuredTopics = FUNDRAISING_TOPICS.slice(0, 8)

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

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <section className="rounded-lg border p-4">
          <h2 className="text-base font-semibold">Browse by state</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {featuredStates.map((state) => (
              <li key={state.stateSlug}>
                <Link
                  href={`/fundraising/${state.stateSlug}/${state.citySlug}/schools/walkathon-fundraising`}
                  className="underline underline-offset-4"
                >
                  {state.stateName}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-base font-semibold">Browse by organization</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {featuredOrgTypes.map((orgType) => (
              <li key={orgType.slug}>
                <Link
                  href={`/fundraising/california/sacramento/${orgType.slug}/walkathon-fundraising`}
                  className="underline underline-offset-4"
                >
                  {orgType.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-base font-semibold">Browse by fundraiser type</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {featuredTopics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/fundraising/texas/austin/schools/${topic.slug}`}
                  className="underline underline-offset-4"
                >
                  {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
