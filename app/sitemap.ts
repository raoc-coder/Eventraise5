import type { MetadataRoute } from 'next'
import { getAllPseoParams } from '@/lib/pseo/us-fundraising-pages'

const SITEMAP_CHUNK_SIZE = 2000
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com'

const staticUrls: MetadataRoute.Sitemap = [
    { 
      url: `${baseUrl}/`, 
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    { 
      url: `${baseUrl}/events`, 
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    { 
      url: `${baseUrl}/events/create`, 
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    { 
      url: `${baseUrl}/events/mine`, 
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    { 
      url: `${baseUrl}/volunteers`, 
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    { 
      url: `${baseUrl}/leaderboard`, 
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    { 
      url: `${baseUrl}/pricing`, 
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    { 
      url: `${baseUrl}/getting-started`, 
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    { 
      url: `${baseUrl}/faqs`, 
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/fundraising`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }
]

const pseoUrls: MetadataRoute.Sitemap = getAllPseoParams().map((item) => ({
    url: `${baseUrl}/fundraising/${item.state}/${item.city}/${item.orgType}/${item.topic}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.65,
}))

async function getEventUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) return []
    const { data } = await supabaseAdmin
      .from('events')
      .select('slug, updated_at, id')
      .eq('is_public', true)
      .limit(5000)
    return (data || []).map((e: any) => ({
      url: `${baseUrl}/events/${e.slug || e.id}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
      changeFrequency: 'daily'
    }))
  } catch {
    return []
  }
}

export async function generateSitemaps() {
  const eventUrls = await getEventUrls()
  const dynamicTotal = pseoUrls.length + eventUrls.length
  const totalDynamicChunks = Math.max(1, Math.ceil(dynamicTotal / SITEMAP_CHUNK_SIZE))
  return Array.from({ length: totalDynamicChunks }, (_, idx) => ({ id: idx }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const eventUrls = await getEventUrls()
  const dynamicUrls = [...pseoUrls, ...eventUrls]
  const start = id * SITEMAP_CHUNK_SIZE
  const end = start + SITEMAP_CHUNK_SIZE
  const currentChunk = dynamicUrls.slice(start, end)

  if (id === 0) {
    return [...staticUrls, ...currentChunk]
  }
  return currentChunk
}


