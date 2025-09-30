import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'EventraiseHub'
    const subtitle = searchParams.get('subtitle') || 'All-in-One Event Management Platform'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1200px',
              padding: '80px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#1D4ED8',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '24px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#1D4ED8',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  letterSpacing: '-0.02em',
                }}
              >
                EventraiseHub
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#1F2937',
                textAlign: 'center',
                lineHeight: '1.1',
                marginBottom: '24px',
                maxWidth: '1000px',
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '32px',
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: '1.4',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </div>

            {/* Bottom accent */}
            <div
              style={{
                width: '200px',
                height: '8px',
                backgroundColor: '#1D4ED8',
                borderRadius: '4px',
                marginTop: '40px',
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG image generation failed:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
