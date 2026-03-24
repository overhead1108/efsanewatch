import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'favicon2.png', 'pwaicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'efsanewatch',
        short_name: 'efsanewatch',
        description: 'Anime ve Manga İzleme Platformu',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        scope: '/efsanewatch/',
        start_url: '/efsanewatch/',
        categories: ['entertainment', 'video', 'books'],
        icons: [
          {
            src: 'pwaicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwaicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwaicon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Anime İzle',
            short_name: 'Anime',
            description: 'En yeni animeleri izle',
            url: '/efsanewatch/?mode=anime',
            icons: [{ src: 'pwaicon.png', sizes: '192x192' }]
          },
          {
            name: 'Manga Oku',
            short_name: 'Manga',
            description: 'En yeni mangaları oku',
            url: '/efsanewatch/?mode=manga',
            icons: [{ src: 'pwaicon.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  base: './',
})
