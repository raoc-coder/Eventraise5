import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com'
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/events`, lastModified: new Date() },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() }
  ]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) return staticUrls
    const { data } = await supabaseAdmin
      .from('events')
      .select('slug, updated_at, id')
      .eq('is_public', true)
      .limit(5000)
    const eventUrls: MetadataRoute.Sitemap = (data || []).map((e: any) => ({
      url: `${baseUrl}/events/${e.slug || e.id}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
      changeFrequency: 'daily'
    }))
    return [...staticUrls, ...eventUrls]
  } catch {
    return staticUrls
  }
}


