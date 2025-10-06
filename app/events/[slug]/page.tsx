import { redirect, notFound } from 'next/navigation'

export default async function EventSlugRedirectPage({ params }: { params: Promise<{ slug?: string }> }) {
  const awaited = await params
  const slug = awaited?.slug || ''

  // If the slug is actually a UUID, redirect directly to ID page
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(slug)) {
    redirect(`/events/${slug}`)
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

    redirect(`/events/${data.id}`)
  } catch {
    redirect('/events')
  }
}


