import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Callister FRC AI Assistant',
  description: 'FRC robot yarışması için yapay zeka asistanı',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
