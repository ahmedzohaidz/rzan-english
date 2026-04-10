import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets:  ['arabic', 'latin'],
  display:  'swap',
  preload:  true,
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title:       'رزان — تعلمي الإنجليزي',
  description: 'منصة تعلم اللغة الإنجليزية لرزان — مع المحققة كلود',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'default',
    title:          'رزان',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
  themeColor:    '#7C3AED',
  viewportFit:   'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="manifest"        href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color"                        content="#7C3AED" />
        <meta name="apple-mobile-web-app-capable"       content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"         content="رزان" />
      </head>
      <body style={{ margin: 0, fontFamily: 'var(--font-cairo), Tajawal, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
