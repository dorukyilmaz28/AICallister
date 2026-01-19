/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // API routes static export için çalışmaz
  // Bu durumda API'ler ayrı bir backend'de olmalı veya
  // client-side'da farklı bir URL kullanılmalı
}

module.exports = nextConfig
