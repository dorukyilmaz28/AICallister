import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import Link from 'next/link'
import { Home } from 'lucide-react'

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
          {children}
          {/* Global Home button */}
          <div className="fixed left-3 top-3 z-50">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-md border border-white/60 backdrop-blur-md transition-colors"
              aria-label="Ana Sayfa"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Ana Sayfa</span>
            </Link>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
