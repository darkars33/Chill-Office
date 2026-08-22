import '@/app/globals.css'
import Providers from '@/providers'
import { PRODUCT_NAME } from '@/lib/constants'

const description =
  'A digital office where everybody is anonymously listening to music. Walk into a room, see who is already in it, say something, move on. Nothing is saved.'

export const metadata = {
  title: `${PRODUCT_NAME} — a room full of strangers listening to the same thing`,
  description,
  icons: { icon: '/favicon.svg' },
  openGraph: { type: 'website', title: PRODUCT_NAME, description },
  twitter: { card: 'summary_large_image', title: PRODUCT_NAME, description },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0b0a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-full w-full bg-void">
      <head>
        {/* Playback and artwork come from YouTube — warm the connections early. */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googlevideo.com" crossOrigin="" />
      </head>
      {/* No background on <body> on purpose. `html` carries it, which makes it
          the canvas background; a second opaque background here would paint as
          an ordinary box and bury the ambient field behind it. */}
      <body className="min-h-full w-full overflow-hidden font-sans text-paper antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
