/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' removed - API routes require serverless functions
  // Static export is not compatible with dynamic API routes
  images: {
    unoptimized: true, // Can be removed if using Vercel Image Optimization
  },
  trailingSlash: true,
}

module.exports = nextConfig
