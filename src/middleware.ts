import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔴🔴🔴 TEST AMAÇLI: MIDDLEWARE TAMAMEN KAPALI 🔴🔴🔴
// Bu geçici bir test - middleware'in sorun olup olmadığını görmek için
export function middleware(request: NextRequest) {
  // TAMAMEN KAPALI - Her şeyi direkt geçir
  return NextResponse.next();
  
  /* ORİJİNAL KOD (ŞİMDİLİK KAPALI)
  const { pathname } = request.nextUrl;

  // 🔴 KRİTİK: API route'larını ASLA redirect etme
  // API route'ları direkt geçir, hiçbir kontrol yapma
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Static dosyalar ve Next.js internal route'ları geçir
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Auth sayfalarına erişim serbest
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Diğer tüm sayfalar için middleware kontrolü yapılabilir
  // Şimdilik sadece API'leri koruyoruz
  return NextResponse.next();
  */
}

// Middleware'in hangi route'larda çalışacağını belirle
// API route'ları ve static dosyalar hariç
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
