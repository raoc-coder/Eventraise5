import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllPseoParams,
  getPseoCopyVariants,
  getPseoFaqs,
  getPseoPageContext,
  getPseoQualityScore,
  getRelatedPseoLinks,
  getStateFundraisingStat,
  PSEO_PAGE_COUNT,
  type PseoParams,
} from '@/lib/pseo/us-fundraising-pages'

type PageProps = {
  params: PseoParams
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com'

export async function generateStaticParams() {
  return getAllPseoParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const context = getPseoPageContext(params)
  if (!context) {
    return {
      title: 'Fundraising Resources | EventraiseHub',
      robots: { index: false, follow: true },
    }
  }

  const { seed, orgType, topic } = context
  const qualityScore = getPseoQualityScore(params)
  const title = `${topic.label} in ${seed.cityName}, ${seed.stateName} for ${orgType.label} | EventraiseHub`
  const description = `Plan ${topic.label.toLowerCase()} in ${seed.cityName}, ${seed.stateName} with practical templates for ${orgType.label.toLowerCase()}. Launch volunteer-led fundraising events and online donations with EventraiseHub.`
  const canonicalPath = `/fundraising/${params.state}/${params.city}/${params.orgType}/${params.topic}`

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonicalPath}`,
      type: 'article',
      locale: 'en_US',
    },
    robots: {
      index: qualityScore >= 65,
      follow: true,
    },
  }
}

export default function LocalFundraisingPseoPage({ params }: PageProps) {
  const context = getPseoPageContext(params)
  if (!context) {
    notFound()
  }

  const { seed, orgType, topic } = context
  const variants = getPseoCopyVariants(params)
  const relatedPages = getRelatedPseoLinks(params, 4)
  const qualityScore = getPseoQualityScore(params)
  const stateStat = getStateFundraisingStat(params)
  const faqs = getPseoFaqs(params)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  const quickIdeas = [
    `Set a clear ${topic.label.toLowerCase()} goal for ${seed.cityName} and define a 30-day timeline.`,
    `Recruit volunteer captains from local ${orgType.label.toLowerCase()} networks in ${seed.stateName}.`,
    ...variants.tips,
  ]

  const seoSummary = `${topic.label} in ${seed.cityName}, ${seed.stateName} for ${orgType.label}`

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        US Local Fundraising Playbook
      </p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{seoSummary}</h1>
      <p className="mt-4 text-base text-muted-foreground">
        EventraiseHub helps volunteer-led teams launch and manage {topic.label.toLowerCase()} with donations,
        registrations, and day-of coordination. This page is one of {PSEO_PAGE_COUNT.toLocaleString()} localized
        fundraising guides for U.S. communities.
      </p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{variants.intro}</p>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">How to run this in {seed.cityName}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {quickIdeas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Built for {orgType.label}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Create campaign pages, collect secure payments, track volunteers, and share impact updates from one
          dashboard. This makes it easier for organizers to run repeatable local fundraising events throughout
          {seed.stateName}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/events/create"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Start a fundraising event
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            View platform pricing
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Local benchmark snapshot</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Estimated local benchmark indicators for campaign planning in {seed.cityName}, {seed.stateName}.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          <li>Estimated volunteer participation rate: {stateStat.volunteerParticipationRate}%</li>
          <li>Typical donor reach target: {stateStat.avgLocalDonors} supporters</li>
          <li>Average online donation conversion range: {stateStat.onlineDonationConversionRate}%</li>
        </ul>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Related guides in {seed.stateName}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {relatedPages.map((item) => (
            <li key={`${item.state}-${item.city}-${item.orgType}-${item.topic}`}>
              <Link
                href={`/fundraising/${item.state}/${item.city}/${item.orgType}/${item.topic}`}
                className="underline decoration-muted-foreground/40 underline-offset-4"
              >
                {item.topic.replace(/-/g, ' ')} for {item.orgType.replace(/-/g, ' ')} in{' '}
                {item.city.replace(/-/g, ' ')}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((item) => (
            <div key={item.question}>
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Page quality score: {qualityScore}/100</p>
      </section>
    </main>
  )
}
