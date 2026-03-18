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
      includeAssets: ['favicon.ico', 'logo.svg'],
      manifest: {
        name: 'CTN Radio',
        short_name: 'CTN Radio',
        description: 'De Guarambaré al mundo. Emisora digital 24/7 con noticias, programación y entretenimiento.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        icons: [
          {
            src: '/logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
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
