/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The room is full-bleed and uses all four corners — the composer, the
  // reaction row and the whisper dock all reach the bottom edge — so the dev
  // overlay covers a real control wherever it is parked. Set this to
  // `{ position: 'bottom-left' }` to bring it back while debugging routes.
  devIndicators: false,
  images: {
    // Album art is served straight from YouTube's thumbnail CDN.
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }],
  },
}

export default nextConfig
