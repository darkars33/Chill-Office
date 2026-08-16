import '@/app/globals.css'

const description =
  'Chill Office — 70s-90s Bollywood classics for chilling with colleagues after hours.'

export const metadata = {
  title: 'Chill Office',
  description,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Chill Office',
    description:
      'Cutting chai, golden hour, and 50 Bollywood classics. Built for chilling with colleagues.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chill Office',
    description: 'Cutting chai, golden hour, and 50 Bollywood classics.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#141017',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-full w-full bg-ink">
      <head>
        {/* Playback and album art come from YouTube — warm the connections early. */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googlevideo.com" crossOrigin="" />
      </head>
      <body className="min-h-full w-full overflow-hidden bg-ink font-sans text-cream">
        {children}
      </body>
    </html>
  )
}
