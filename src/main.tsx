import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { useStore } from './store/useStore'

if (import.meta.env.DEV) {
  // @ts-expect-error - solo per debug manuale in dev
  window.__store = useStore
}

// Aggiorna il service worker in background quando c'è una nuova versione,
// senza chiedere nulla all'utente: al prossimo avvio dell'app userà la nuova build.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
