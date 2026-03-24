import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  FUNDRAISING_TOPICS,
  ORGANIZATION_TYPES,
  PSEO_PAGE_COUNT,
  US_STATE_CAPITAL_SEEDS,
} from '@/lib/pseo/us-fundraising-pages'

export default function ReportsPage() {
  const cohortByOrgType = ORGANIZATION_TYPES.map((item) => ({
    label: item.label,
    pages: US_STATE_CAPITAL_SEEDS.length * FUNDRAISING_TOPICS.length,
    urlPattern: `/fundraising/*/*/${item.slug}/*`,
  }))

  const topTopicCohorts = FUNDRAISING_TOPICS.slice(0, 10).map((item) => ({
    label: item.label,
    pages: US_STATE_CAPITAL_SEEDS.length * ORGANIZATION_TYPES.length,
    urlPattern: `/fundraising/*/*/*/${item.slug}`,
  }))

  const stateCohorts = US_STATE_CAPITAL_SEEDS.slice(0, 12).map((item) => ({
    label: item.stateName,
    pages: ORGANIZATION_TYPES.length * FUNDRAISING_TOPICS.length,
    urlPattern: `/fundraising/${item.stateSlug}/*/*/*`,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="display text-gray-900 mb-2">Admin Reports & Analytics</h1>
          <p className="text-gray-600 text-lg">Cohort monitoring for pSEO rollout and indexing growth</p>
        </div>

        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-gray-900">pSEO rollout snapshot</CardTitle>
            <CardDescription className="text-gray-600">
              Track indexation and performance cohorts for your 10,000 localized fundraising pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-gray-600">Total pSEO pages</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{PSEO_PAGE_COUNT.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-gray-600">Sitemap index</p>
                <Link className="mt-1 block text-sm font-medium text-blue-700 underline" href="/sitemap.xml">
                  /sitemap.xml
                </Link>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-gray-600">Fundraising hub</p>
                <Link className="mt-1 block text-sm font-medium text-blue-700 underline" href="/fundraising">
                  /fundraising
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Weekly Search Console checklist</CardTitle>
            <CardDescription className="text-gray-600">
              Use these filters and URL patterns to monitor discovery, indexation, and rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              <li>Pages report filter: URL contains <code>/fundraising/</code></li>
              <li>Track counts: Indexed, Crawled-not-indexed, Discovered-not-indexed, Duplicate</li>
              <li>Performance report filter: URL contains <code>/fundraising/</code></li>
              <li>Compare last 7 days vs previous 7 days for impressions, clicks, CTR, average position</li>
              <li>Prioritize cohorts with growing impressions but low CTR for title/meta improvements</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Cohorts by organization type</CardTitle>
            <CardDescription className="text-gray-600">
              Start with these five cohort filters in Search Console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-semibold text-gray-800">Cohort</th>
                    <th className="py-2 pr-4 font-semibold text-gray-800">Expected pages</th>
                    <th className="py-2 font-semibold text-gray-800">URL pattern</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortByOrgType.map((item) => (
                    <tr key={item.urlPattern} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-700">{item.label}</td>
                      <td className="py-2 pr-4 text-gray-700">{item.pages.toLocaleString()}</td>
                      <td className="py-2 font-mono text-xs text-gray-700">{item.urlPattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Top topic cohorts</CardTitle>
              <CardDescription className="text-gray-600">
                Suggested starting set for topic-level indexation tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                {topTopicCohorts.map((item) => (
                  <li key={item.urlPattern} className="flex items-start justify-between gap-2 border-b pb-2 last:border-0">
                    <span>{item.label}</span>
                    <span className="text-xs font-mono text-gray-600">{item.urlPattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Priority states</CardTitle>
              <CardDescription className="text-gray-600">
                Track these state cohorts first, then expand to all 50 states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                {stateCohorts.map((item) => (
                  <li key={item.urlPattern} className="flex items-start justify-between gap-2 border-b pb-2 last:border-0">
                    <span>{item.label}</span>
                    <span className="text-xs font-mono text-gray-600">{item.urlPattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}