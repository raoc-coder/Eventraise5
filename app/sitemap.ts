import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    }
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


