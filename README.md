# risparmio-assistant

Monorepo con backend FastAPI e app mobile React Native (Expo) per una semplice dashboard di risparmio.

## Avvio backend

1. Assicurarsi di avere Docker installato.
2. Avviare Postgres e il backend FastAPI:

```bash
docker-compose up --build
```

Il backend sarà disponibile su `http://localhost:8000`.

## Avvio mobile

1. Entrare nella cartella `mobile` e installare le dipendenze:

```bash
cd mobile
npm install
```

2. Avviare l'app Expo:

```bash
npm start
```

Expo utilizzerà la porta predefinita (ad es. 19000). Assicurarsi che il backend sia in esecuzione per poter recuperare i dati.
