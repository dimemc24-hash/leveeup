import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*'],
      manifest: {
        name: 'LeveeUp — Cryptid Hunt',
        short_name: 'LeveeUp',
        description: 'Gamified 2nd grade learning through Cryptid Investigations',
        theme_color: '#2d5016',
        background_color: '#f5f0e1',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/assets/ui/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/ui/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/ui/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'data-cryptids': ['./src/features/themes/cryptids/cryptidTheme.ts'],
        },
      },
    },
  },
})
