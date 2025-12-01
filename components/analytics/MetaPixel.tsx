'use client'

import { useEffect } from 'react'
import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function MetaPixel() {
  useEffect(() => {
    // Immediately inject Meta Pixel into head for Meta Events Manager detection
    if (typeof window !== 'undefined' && META_PIXEL_ID) {
      // Check if already injected
      if (document.getElementById('meta-pixel-script')) {
        return
      }

      // Create and inject the script directly into head
      const script = document.createElement('script')
      script.id = 'meta-pixel-script'
      script.innerHTML = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`
      
      // Insert at the very beginning of head
      const head = document.head || document.getElementsByTagName('head')[0]
      if (head.firstChild) {
        head.insertBefore(script, head.firstChild)
      } else {
        head.appendChild(script)
      }
    }
  }, [])

  if (!META_PIXEL_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID environment variable is not set')
    }
    return null
  }

  // Complete Meta Pixel code - Standard format from Meta
  const pixelCode = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`

  return (
    <>
      {/* Meta Pixel Code - Also using Script component as backup */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: pixelCode,
        }}
      />
      {/* Noscript fallback - CRITICAL for Meta Events Manager detection */}
      {/* This is server-rendered and MUST be visible in HTML source */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

