# Artist Portal MVP

A gated, immersive fan portal for Devin Townsend's Dreampeace ambient project. The full DT portal (catalog, albums, podcasts) lives on the `full-portal-v1` branch and will return in a later phase.

## Current launch scope

The app on `main` is a Patreon-gated single-section experience:

1. **`/`** — a public fever-dream landing that crossfades into a Patreon sign-in card.
2. **Patreon OAuth** — on success, lands the user directly on `/dreampeace`.
3. **`/dreampeace`** — the ambient sub-experience: portal-style arrival fade, canvas audio visualizer driven by Web Audio API frequency analysis, 7 album-specific themes.
4. **`/login`** — OAuth-error fallback rendering the same Patreon login card.

Non-Dreampeace routes (`/catalog`, `/album/*`, `/podcasts`, DT homepage) are not present on `main`. To restore the full portal later, check out files from `full-portal-v1`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 |
| Auth | Patreon OAuth (user gate), Audius OAuth (Dreampeace streaming), JWT (`jose`) |
| Audio | Audius SDK, Web Audio API |
| Database | Supabase (Postgres + RLS) |
| Fonts | Geist Sans + Geist Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A Supabase project (see `supabase/README.md` for setup)

### Environment Variables

Create `.env.local` with:

```env
# Patreon OAuth
PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=
PATREON_REDIRECT_URI=

# Audius (for Dreampeace streaming)
AUDIUS_API_KEY=

# JWT session signing
JWT_SECRET=

# Supabase (per src/lib/supabase.ts)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Run migrations before first boot (see `supabase/README.md`): `001_initial_schema.sql` then `002_dreampeace_backend.sql`.

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthed users see the fever-dream sequence; authed users redirect straight to `/dreampeace`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Fever-dream landing (public; authed → /dreampeace)
│   ├── login/                   # OAuth-error fallback card
│   ├── dreampeace/              # Ambient experience
│   ├── actions/                 # Server actions (sessions, preferences)
│   └── api/
│       ├── auth/                # Patreon + Audius OAuth callbacks
│       └── device-tier/         # Pure scoring endpoint for visualizer quality
├── components/
│   ├── landing/                 # FeverDream, LoginCard
│   ├── layout/                  # Navbar, Footer, AuthGate
│   ├── player/                  # Audio player UI + Zustand wrapper
│   └── dreampeace/              # Visualizer, transitions, ambient cards
├── hooks/                       # usePlayer, useAuth, useDeviceTier
├── lib/                         # audius, audius-cache, auth-helpers, jwt, supabase, types
├── store/                       # Zustand player store
└── middleware.ts                # JWT enforcement; PUBLIC_PATHS = /, /login, /api/auth, /api/device-tier

supabase/migrations/             # 001 initial + 002 dreampeace backend
```

## License

Private — not licensed for redistribution.
