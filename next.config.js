/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' removed - API routes require serverless functions
  // Static export is not compatible with dynamic API routes
  images: {
    unoptimized: true, // Can be removed if using Vercel Image Optimization
  },
  trailingSlash: true,
  // API route'ları için redirect'i önlemek için
  async redirects() {
    return [];
  },
  // API route'ları için rewrite ekle
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
