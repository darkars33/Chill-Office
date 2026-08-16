import '@/app/globals.css'

const description =
  'Chill Office — a listening room for 50 Bollywood classics from 1970 to 1999. Golden hour, cutting chai, and the whole queue on one screen.'

export const metadata = {
  title: 'Chill Office — the after-hours listening room',
  description,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Chill Office',
    description,
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
  viewportFit: 'cover',
  themeColor: '#07060b',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-full w-full bg-void">
      <head>
        {/* Playback and album art come from YouTube — warm the connections early. */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googlevideo.com" crossOrigin="" />
      </head>
      <body className="min-h-full w-full overflow-hidden bg-void font-sans text-cream antialiased">
        {children}
      </body>
    </html>
  )
}
