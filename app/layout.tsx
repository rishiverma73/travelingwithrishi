import type { Metadata } from 'next'
import { Fraunces, Inter, Caveat, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Traveling With Rishi',
    template: '%s | Traveling With Rishi',
  },
  description:
    'A personal travel diary chasing every state and union territory of India — one story at a time.',
  openGraph: {
    siteName: 'Traveling With Rishi',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-inter antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
