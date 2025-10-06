import { redirect, notFound } from 'next/navigation'

export default async function EventSlugRedirectPage({ params }: { params: Promise<{ slug?: string }> }) {
  const awaited = await params
  const slug = awaited?.slug || ''

  // If the slug is actually a UUID, redirect directly to ID page
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(slug)) {
    // Render a minimal page with client-side replace to avoid potential redirect loops
    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0; url=/events/${slug}`} />
        </head>
        <body />
      </html>
    ) as any
  }

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) {
      redirect('/events')
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error || !data?.id) {
      notFound()
    }

    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0; url=/events/${data.id}`} />
        </head>
        <body />
      </html>
    ) as any
  } catch {
    redirect('/events')
  }
}


