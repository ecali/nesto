# Nesto

Household management app for shared expenses, calendar appointments, and reminders.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui
- **Backend**: PocketBase (SQLite + Auth + Realtime)
- **State**: Zustand
- **Routing**: React Router v7

## Project Structure

```
nesto/
  frontend/          # React app
  pocketbase/        # PocketBase backend
    pb_migrations/   # Schema migrations
    pb_hooks/        # Custom hooks (optional)
    schema/          # Exported schema JSON
  .github/workflows/ # CI pipeline
```

## Local Development

### Backend (PocketBase)

```bash
cd pocketbase
chmod +x download.sh && ./download.sh   # Download PocketBase binary
./pocketbase serve --http=0.0.0.0:8090
```

Open http://127.0.0.1:8090/_/ for the admin UI.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Edit VITE_PB_URL if needed
npm run dev
```

Open http://localhost:5173.

### Both at once (from repo root)

```bash
npm run setup:be    # Download PocketBase (first time only)
npm run dev         # Starts both backend and frontend
```

## Deploy

### 1. Backend — Pockethost.io (free)

1. Create an account at https://pockethost.io
2. Create a new project (e.g., `nesto`)
3. Upload the folder `pocketbase/pb_migrations/` to apply schema migrations
4. Note your project URL: `https://<name>.pockethost.io`

### 2. Frontend — Vercel (free, auto-deploy on push)

1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import the `ecali/nesto` repository
4. Vercel will auto-detect the `vercel.json` config
5. Add environment variable:
   - `VITE_PB_URL` = `https://<name>.pockethost.io` (your Pockethost URL)
6. Click **Deploy**

Every push to `main` triggers a new deploy automatically.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_PB_URL` | `http://127.0.0.1:8090` | PocketBase server URL |
