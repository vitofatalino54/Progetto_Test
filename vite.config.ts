import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Su GitHub Pages l'app viene servita da un sottopercorso (github.io/<repo>/),
// mentre in dev e su Netlify/Vercel gira dalla root. Il workflow di deploy per
// Pages imposta GITHUB_PAGES=true prima della build.
const base = process.env.GITHUB_PAGES ? '/Progetto_Test/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Allenamento - Gym Tracker',
        short_name: 'Allenamento',
        description: 'Traccia i tuoi allenamenti in palestra: serie, ripetizioni, carichi, timer di recupero e progressi, tutto offline.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        lang: 'it',
        icons: [
          { src: `${base}pwa-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}pwa-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // precache tutto il bundle (compresi i chunk lazy come Progressi) per l'uso offline completo
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // service worker attivo anche in `npm run dev`, per testare l'offline senza dover buildare
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
