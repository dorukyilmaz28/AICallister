/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // API routes static export için çalışmaz
  // API klasörünü build'den hariç tutmak için
  // src/app/api klasörünü ignore etmek gerekiyor
}

module.exports = nextConfig
