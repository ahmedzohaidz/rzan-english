import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest:        'public',
  register:    true,
  disable:     process.env.NODE_ENV === 'development',
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/rzan\.diagpro\.tech\/.*/i,
        handler:    'NetworkFirst',
        options: {
          cacheName:   'rzan-pages',
          expiration:  { maxEntries: 50, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler:    'CacheFirst',
        options: {
          cacheName:  'rzan-images',
          expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler:    'StaleWhileRevalidate',
        options:    { cacheName: 'google-fonts' },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  reactCompiler: true,
}

export default withPWA(nextConfig)
