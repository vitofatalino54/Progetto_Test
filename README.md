# Allenamento — Gym Workout Tracker

App web mobile-first per tracciare gli allenamenti in palestra dal telefono:
sedute, serie, ripetizioni, carichi, timer di recupero, storico e progressi.
**Nessun backend, nessun account**: tutti i dati restano nel browser
(localStorage) e l'app funziona **completamente offline** una volta aperta
almeno una volta (è una PWA installabile).

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Zustand (stato + persistenza automatica su localStorage)
- Recharts (grafici in Progressi, caricato solo quando serve)
- vite-plugin-pwa (manifest + service worker offline-first)

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri l'URL stampato in console (di solito `http://localhost:5173`). Il
service worker è attivo anche in dev (`devOptions.enabled` in
`vite.config.ts`), quindi puoi già testare l'offline da qui.

### Build di produzione

```bash
npm run build   # genera la cartella dist/, pronta per un deploy statico
npm run preview # serve dist/ in locale per un ultimo controllo
```

## Come sono organizzati i dati

- `src/data/program.default.json` — programma precaricato al primo avvio
  (sedute A/B/C, esercizi, serie/ripetizioni, tempi di recupero). Dopo il
  primo avvio il programma vive nello store e si modifica dalla schermata
  **Programma** dell'app, non nel file.
- Tutto lo stato (programma, storico allenamenti, impostazioni) è salvato
  automaticamente in `localStorage` ad ogni modifica.
- **Backup**: dalla Home, tocca l'icona ⚙️ per esportare/importare un JSON
  completo di tutti i dati — utile prima di cancellare i dati del browser o
  per spostare lo storico su un altro telefono.

## Deploy online

L'app è statica (solo file in `dist/` dopo la build): va bene qualunque
hosting statico. Tre opzioni comuni:

### Netlify

1. Collega il repository su [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project".
2. Build command: `npm run build` — Publish directory: `dist`.
3. Deploy. Netlify gestisce da solo HTTPS (richiesto dalle PWA) e i redirect SPA.

In alternativa, senza collegare il repo:
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

### Vercel

1. Collega il repository su [vercel.com](https://vercel.com) → "New Project".
2. Framework preset: Vite (rilevato automaticamente). Build command:
   `npm run build`, Output directory: `dist`.
3. Deploy.

In alternativa: `npx vercel --prod` dalla cartella del progetto.

### GitHub Pages

GitHub Pages serve i progetti da un sottopercorso (`https://<utente>.github.io/<repo>/`),
quindi va indicata la `base` a Vite:

1. In `vite.config.ts` aggiungi `base: '/<nome-repo>/'` dentro `defineConfig({...})`
   (non serve se pubblichi su un dominio personalizzato o su una pagina
   utente/organizzazione tipo `<utente>.github.io`).
2. Build e pubblica la cartella `dist/` sul branch `gh-pages` (con
   [`gh-pages`](https://www.npmjs.com/package/gh-pages) o un Action):
   ```bash
   npm install -D gh-pages
   npm run build
   npx gh-pages -d dist
   ```
3. Attiva GitHub Pages nelle impostazioni del repo puntando al branch `gh-pages`.

> Qualunque hosting tu scelga, serve **HTTPS** (obbligatorio per service
> worker, Wake Lock e installazione PWA) — Netlify, Vercel e GitHub Pages lo
> offrono di default.

## Installare l'app sul telefono

### Android (Chrome)

1. Apri l'URL dell'app pubblicata in Chrome.
2. Tocca il menu (⋮) in alto a destra → **"Aggiungi a schermata Home"** /
   **"Installa app"** (Chrome potrebbe anche mostrare da solo un banner di
   installazione).
3. Conferma: l'icona compare sulla home screen e l'app si apre a schermo
   intero, senza barra del browser.

### iPhone/iPad (Safari)

1. Apri l'URL dell'app in **Safari** (l'installazione da altri browser iOS
   non è supportata da Apple).
2. Tocca l'icona di condivisione (il quadrato con la freccia verso l'alto).
3. Scorri e tocca **"Aggiungi alla schermata Home"**.
4. Conferma: l'icona compare in home, l'app si apre a schermo intero.

Da quel momento l'app funziona offline: dopo il primo caricamento, tutti gli
asset restano cache sul telefono grazie al service worker, e i dati restano
salvati in locale nel browser/PWA di quel dispositivo. Ricorda di usare
**Backup → Esporta JSON** ogni tanto se vuoi conservare lo storico anche in
caso di reset del telefono o del browser.
