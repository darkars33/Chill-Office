/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Album art is served straight from YouTube's thumbnail CDN.
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }],
  },
}

export default nextConfig
