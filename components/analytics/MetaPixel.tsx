import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function MetaPixel() {
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
      {/* Meta Pixel ID: ${META_PIXEL_ID} - For Meta Events Manager detection */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: pixelCode,
        }}
      />
      {/* Noscript fallback - REQUIRED for Meta Events Manager detection */}
      {/* This is server-rendered and will be visible in HTML source */}
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

