import { NextResponse } from 'next/server'

const SITEMAP_CHUNKS = [0, 1, 2, 3, 4]

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com'
  const now = new Date().toISOString()

  const sitemapEntries = SITEMAP_CHUNKS.map(
    (id) => `<sitemap><loc>${baseUrl}/sitemap/${id}.xml</loc><lastmod>${now}</lastmod></sitemap>`
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
