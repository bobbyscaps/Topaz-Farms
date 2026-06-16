import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, Nunito } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const pixel = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

const body = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Epoch Acres 🌾 — farm the Topaz DEX',
  description:
    'Epoch Acres is a farm-simulation UI over the real Topaz ve(3,3) DEX. Plant liquidity, water gauges with veTOPAZ votes, harvest fees, bribes and emissions — and finally understand DeFi.',
}

export const viewport: Viewport = {
  themeColor: '#6db33f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
