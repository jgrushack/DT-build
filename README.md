# Artist Portal MVP

A gated, immersive fan portal for streaming an artist's complete music catalog. Built as a modern web application with a glassmorphism design system, persistent audio player, and a dedicated ambient listening sub-experience.

## Features

### Authenticated Access
- **Patreon OAuth** — requires an active patron subscription to the artist
- **Audius OAuth** — requires following the artist on Audius
- JWT-based session management with middleware-enforced route protection

### Music Catalog
- Browse the full discography across 20+ albums and ~200 tracks
- Genre filtering and search
- Album detail pages with complete tracklists
- Audio streaming via the Audius discovery provider

### Persistent Audio Player
- Fixed bottom bar with play/pause, skip, seek, and volume controls
- Queue management (add, remove, reorder)
- Global keyboard shortcuts (Space, arrow keys)
- Zustand-powered state with a `_seekVersion` pattern for cross-component seek synchronization

### Dreampeace — Ambient Sub-Experience
- A separate immersive mode for ambient/meditation music
- Animated portal transition (scale + blur tunnel effect) between the main site and Dreampeace
- Real-time canvas audio visualizer driven by Web Audio API frequency analysis
- 7 distinct visualizer themes: warm-pulse, aurora-sweep, sunrise-rays, nebula-field, falling-snow, rising-bubbles, water-ripples
- Light theme override with soft cream/purple palette

### Design System — Forest Glassmorphism
- Warm, dark, natural aesthetic with a stone/sage/amber/cream palette
- Multi-level glass panels using `backdrop-filter: blur()`
- Premium liquid-glass variants with multi-stop gradient refraction
- Custom animation system (float, shimmer, slide-up, portal transitions)
- Context-aware navbar that adapts branding between main site and Dreampeace

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 |
| Auth | Patreon OAuth, Audius OAuth, JWT (`jose`) |
| Audio | Audius SDK v11, Web Audio API |
| Database | Supabase |
| Fonts | Geist Sans + Geist Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Environment Variables

Create a `.env.local` file with:

```env
# Patreon OAuth
PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=
PATREON_REDIRECT_URI=

# Audius
AUDIUS_API_KEY=

# JWT
JWT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. You'll be redirected to the login page until authenticated.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home (hero, popular tracks, albums)
│   ├── login/              # Login / landing page
│   ├── catalog/            # Full catalog browsing
│   ├── album/[albumId]/    # Album detail pages
│   ├── dreampeace/         # Ambient sub-experience
│   └── api/auth/           # OAuth callback routes
├── components/
│   ├── player/             # Audio player UI (Player, ProgressBar, Queue, Volume)
│   ├── layout/             # Navbar, Footer, AuthGate
│   ├── catalog/            # AlbumCard, TrackCard, FilterBar
│   └── dreampeace/         # Visualizer, transitions, ambient cards
├── store/                  # Zustand player store
├── hooks/                  # usePlayer, useAuth
├── lib/                    # Catalog data, auth helpers, types
└── middleware.ts           # JWT auth enforcement
```

## License

Private — not licensed for redistribution.
