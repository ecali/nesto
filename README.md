# Nesto

App per la gestione familiare: spese, calendario e promemoria.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind v4 + shadcn/ui
- **Backend**: PocketBase (SQLite + Auth + Realtime)
- **State**: Zustand
- **Routing**: React Router v7

## Struttura

```
nesto/
  frontend/          # App React
  pocketbase/        # Backend PocketBase
    pb_migrations/   # Migrazioni schema
    pb_hooks/        # Custom hooks (opzionale)
    schema/          # Schema JSON esportato
```

## Setup locale

### Backend (PocketBase)

```bash
# Scarica PocketBase
cd pocketbase

# macOS (ARM)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.25.2/pocketbase_0.25.2_darwin_arm64.zip
unzip pocketbase_0.25.2_darwin_arm64.zip

# Avvia
./pocketbase serve --http=0.0.0.0:8090
```

Poi apri http://127.0.0.1:8090/_/ per l'admin UI.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Apri http://localhost:5173

## Deploy su Pockethost.io

1. Crea account su https://pockethost.io
2. Crea un nuovo progetto
3. Carica le migrazioni da `pocketbase/pb_migrations/`
4. Imposta `VITE_PB_URL` con l'URL del progetto

## Variabili d'ambiente

Copia `.env.example` in `.env`:

```
VITE_PB_URL=http://127.0.0.1:8090
```
