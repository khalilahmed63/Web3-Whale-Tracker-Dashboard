# Web3 Whale Tracker Dashboard

Production-focused whale activity dashboard built with Next.js, TypeScript, and Tailwind.

Tracks large transfers across Ethereum, Base, and Polygon with a polling ingestion loop, alert feed, flow visualization, and a premium dark UI.

## Features

- Real-time style polling (15s UI refresh + internal poll endpoint)
- Multi-chain support: Ethereum, Base, Polygon
- Global whale mode (no wallet config required)
- Large transfer alerts and whale activity feed
- Inflow/outflow analytics and 12h flow chart
- Per-whale metrics (24h), sortable transaction table, pagination
- Dark-only premium UI with skeletons, animated KPIs, and interactive spotlight effects

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Alchemy API (Transfers endpoint)

## Environment Variables

Create `.env.local`:

```bash
ALCHEMY_API_KEY=your_alchemy_key
CRON_SECRET=your_random_secret
```

Notes:
- `TRACKED_WALLETS_JSON` is optional. If omitted, the app runs in global whale mode.
- Keep `.env.local` private (already gitignored).

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## API Routes

- `GET /api/dashboard?chain=all|ethereum|base|polygon`  
  Aggregated dashboard payload: summary, flow series, wallet metrics, recent transactions, alerts.
- `GET /api/transactions`  
  Recent normalized whale transactions.
- `GET /api/alerts`  
  Recent UI alerts.
- `GET /api/wallets`  
  Wallet metrics snapshot.
- `GET|POST /api/internal/poll`  
  Internal poll trigger (protected by `x-cron-secret` when configured).
