import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events/${params.id}`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      const event = data.event
      
      if (event?.title) {
        return {
          title: `${event.title} — EventraiseHub`,
          description: event.description || `Join ${event.title} on EventraiseHub`,
          openGraph: {
            title: `${event.title} — EventraiseHub`,
            description: event.description || `Join ${event.title} on EventraiseHub`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${params.id}`,
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${event.title} — EventraiseHub`,
            description: event.description || `Join ${event.title} on EventraiseHub`,
          },
        }
      }
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Event — EventraiseHub',
    description: 'Join this event on EventraiseHub',
  }
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
