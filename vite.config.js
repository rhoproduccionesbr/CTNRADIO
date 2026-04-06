import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'pwa-icon.png', 'splash-icon.png'],
      manifest: {
        name: 'CTN Radio — De Guarambaré al Mundo',
        short_name: 'CTN Radio',
        description: 'Emisora digital 24/7 con noticias, programación en vivo, chat comunitario y entretenimiento. Desde Guarambaré, Paraguay.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['music', 'entertainment', 'news'],
        icons: [
          {
            src: '/logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/splash-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/stream': {
        target: 'http://136.248.117.199/radio.mp3',
        changeOrigin: true,
        rewrite: (path) => '',
        secure: false // Ignorar problemas de certificado con el IP
      },
      '/api/oyentes': {
        target: 'http://136.248.117.199:3001/api/oyentes',
        changeOrigin: true,
        rewrite: (path) => '',
      },
      '/socket.io/': {
        target: 'http://136.248.117.199:3001',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
