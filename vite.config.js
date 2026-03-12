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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CTN Radio',
        short_name: 'CTN Radio',
        description: 'De Guarambaré al mundo. Emisora digital 24/7 con noticias, programación y entretenimiento.',
        theme_color: '#F8F9FA',
        background_color: '#F8F9FA',
        display: 'standalone',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/stream': {
        target: 'http://136.248.117.199/listen/ctn-radio/radio.mp3',
        changeOrigin: true,
        rewrite: (path) => '',
        secure: false // Ignorar problemas de certificado con el IP
      },
      '/api/nowplaying': {
        target: 'http://136.248.117.199/api/nowplaying/ctn-radio',
        changeOrigin: true,
        rewrite: (path) => '',
        secure: false
      }
    }
  }
})
