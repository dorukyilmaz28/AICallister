import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Callister FRC AI Assistant',
  description: 'FRC robot yarışması için yapay zeka asistanı',
  metadataBase: new URL('https://callisterai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Callister FRC AI Assistant',
    description: 'FRC için yapay zeka destekli sohbet ve kod kütüphanesi',
    url: 'https://callisterai.com',
    siteName: 'Callister AI',
    images: [
      { url: '/8f28b76859c1479d839d270409be3586.jpg', width: 800, height: 800, alt: 'Callister AI' },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Callister FRC AI Assistant',
    description: 'FRC için yapay zeka destekli sohbet ve kod kütüphanesi',
    images: ['/8f28b76859c1479d839d270409be3586.jpg'],
  },
  keywords: [
    'FRC', 'FIRST Robotics', 'WPILib', 'robotics', 'code snippets',
    'The Blue Alliance', 'FRC AI', 'robot programming', 'Java', 'C++', 'Python'
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
