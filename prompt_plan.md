# Audius Artist Portal — MVP Build Playbook

## For use with Claude Code

**Project**: Custom streaming site for artist catalog, built on the Audius API
**Architecture**: Option A (security through routing) with path to Option C (native gating)
**Stack**: Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · @audius/sdk
**Timeline**: 8 weeks / 4 sprints

---

## How to Use This Playbook

Each numbered section below is a **Claude Code prompt**. Run them in order — each builds on what the previous one produced. Copy the prompt text (everything inside the code block) into Claude Code and let it execute.

Before starting: create a new directory for the project and `cd` into it.

**Convention**: Prompts marked with `[DECISION NEEDED]` require you to provide input (artist choice, API keys, etc.) before running.

### Prompt Dependency Order

```
0 (scaffold) → 1 (SDK abstraction) → 2 (catalog UI) → 3 (player)
                                         ↓
                                    4 (database) → 5 (auth) → 6 (access gating)
                                                                    ↓
                                                              7 (usage tracking)
                                                                    ↓
                                                         8 (dreampeace) → 9 (admin)
                                                                              ↓
                                                                     10 (polish) → 11 (deploy)
```

Run strictly in order. Each prompt assumes all prior prompts have completed successfully.

### Complete Environment Variables

Create `.env.local` with all of these before starting Prompt 4:

```
# Audius
NEXT_PUBLIC_AUDIUS_APP_NAME=artist-portal-mvp

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth (Audius OAuth)
AUDIUS_CLIENT_ID=
AUDIUS_CLIENT_SECRET=

# Auth (Patreon OAuth)
PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=

# NextAuth
NEXTAUTH_SECRET=        # run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_API_KEY=          # run: openssl rand -hex 16
ADMIN_PASSWORD=         # pick something for dev

# Feature flags
NEXT_PUBLIC_MOCK_AUTH=false  # set true to simulate tier levels in dev
```

---

## PROMPT 0 — Project Scaffold + Artist Discovery

```
Create a new Next.js 14 project with the App Router, TypeScript, and Tailwind CSS. Use `npx create-next-app@latest` with these options: TypeScript yes, Tailwind yes, ESLint yes, App Router yes, src/ directory yes, import alias @/*.

After scaffolding, install these dependencies:
- @audius/sdk (Audius JavaScript SDK)
- @supabase/supabase-js (database client)
- next-auth (authentication)
- zustand (lightweight state management for audio player)

Then create a script at `scripts/find-artist.ts` that:
1. Initializes the Audius SDK with app name "artist-portal-mvp"
2. Searches for the artist "RAC" (a known artist with 200+ tracks on Audius)
3. Fetches their user profile (ID, handle, follower count, track count)
4. Fetches their first 50 tracks (title, ID, duration, artwork, genre, mood, play count)
5. Fetches their playlists/albums (name, ID, track count, artwork)
6. Writes all results to `scripts/artist-data.json`

Run the script with `npx tsx scripts/find-artist.ts` and show me the output.

If RAC doesn't return good results, try these alternatives: deadmau5 (handle: deadmau_five), 3LAU, or Skrillex. We need an artist with at least 15 tracks and ideally some playlists.

Also set up the project structure:
src/
  app/
    layout.tsx
    page.tsx
    (catalog)/
      page.tsx
      [trackId]/page.tsx
    (dreampeace)/
      dreampeace/page.tsx
    api/
      auth/[...nextauth]/route.ts
      events/route.ts
  components/
    player/
    catalog/
    layout/
    auth/
  lib/
    audius.ts        (SDK wrapper / abstraction layer)
    supabase.ts      (Supabase client)
    types.ts         (shared TypeScript types)
  hooks/
    usePlayer.ts
    useAuth.ts
  store/
    playerStore.ts
```

---

## PROMPT 1 — Audius SDK Abstraction + Content Types

```
Using the artist data we discovered in the previous step (check scripts/artist-data.json for the real IDs), build the Audius abstraction layer.

Create `src/lib/audius.ts` that wraps the @audius/sdk with these functions:

1. `getArtistProfile(handle: string)` — returns artist name, bio, image, follower count, track count
2. `getArtistTracks(userId: string, limit?: number, offset?: number)` — returns paginated tracks
3. `getArtistPlaylists(userId: string)` — returns all playlists/albums
4. `getTrack(trackId: string)` — returns full track details including artwork URLs
5. `getPlaylistTracks(playlistId: string)` — returns tracks in a playlist
6. `getStreamUrl(trackId: string)` — returns the streaming URL for a track. Include error handling: if the stream URL fails a HEAD check, return null. Log the error. The player should handle null gracefully (show "Track unavailable" and auto-skip).
7. `searchTracks(query: string, userId?: string)` — search within artist catalog
8. `getTrendingTracks(userId: string)` — returns tracks sorted by play count

Create `src/lib/types.ts` with these interfaces:
- Track (id, title, duration, artwork, genre, mood, playCount, releaseDate, description)
- Artist (id, handle, name, bio, profileImage, coverImage, followerCount, trackCount)
- Playlist (id, name, description, artwork, trackCount, tracks, isAlbum)
- AccessTier (enum: PUBLIC, AUTHENTICATED, PATRON)
- ContentType (enum: TRACK, DEMO, WIP, LIVE_PERFORMANCE) — distinguishes studio releases from special content
- Section (enum: MAIN, DREAMPEACE, HEAVYDEVY)
- ContentItem (extends Track with accessTier, contentType, and section fields)

Important: The abstraction layer should normalize the Audius SDK responses into our clean types. This is the layer we'll swap out if we move from Option A to Option C later. No other part of the codebase should import from @audius/sdk directly.

Write a test script at `scripts/test-audius.ts` that calls each function with real data from our test artist and logs the results. Run it to verify everything works.
```

---

## PROMPT 2 — Catalog UI + Server Components

```
Build the public catalog browsing experience. This should work without any authentication — it's the discovery layer.

`src/app/page.tsx` (Landing page):
- Hero section with artist name, bio, and cover image (fetched server-side from Audius)
- Featured/latest tracks section (6 tracks, card layout)
- "Browse Full Catalog" CTA
- "Enter Dreampeace" CTA (separate section link, visually distinct)
- Clean, dark theme — think: premium music experience, not social media

`src/app/(catalog)/page.tsx` (Full catalog):
- Server component that fetches all tracks and playlists from Audius
- Filter/sort controls: by release date, play count, genre, mood, content type (all, tracks, demos, WIP, live)
- Two view modes: grid (album art focused) and list (track details focused)
- Playlist/album sections with expandable track listings
- Each track card shows: artwork, title, duration, play count, genre
- Clicking a track should trigger playback (wire to player in next prompt)
- Tracks that require authentication show a subtle lock icon overlay

`src/app/(catalog)/[trackId]/page.tsx` (Track detail):
- Server component fetching single track data
- Large artwork display
- Full track metadata (title, genre, mood, duration, play count, release date)
- Description/notes from the artist
- "Play" button (prominent)
- Back navigation to catalog

`src/components/catalog/TrackCard.tsx` — reusable card component
`src/components/catalog/PlaylistCard.tsx` — playlist/album card
`src/components/catalog/FilterBar.tsx` — filter/sort controls
`src/components/layout/Navbar.tsx` — top navigation (logo, catalog link, dreampeace link, login button)
`src/components/layout/Footer.tsx` — minimal footer

Use Tailwind for styling. Dark theme: bg-zinc-950 base, zinc-900 cards, zinc-100 text. Accent color: pick something that works with the artist's aesthetic.

Use Next.js server components for data fetching (no client-side fetch waterfall). Use `loading.tsx` files for skeleton states while data loads.

Verify by running `npm run dev` and confirm the catalog displays real tracks from Audius.
```

---

## PROMPT 3 — Audio Player

```
Build a persistent audio player that lives at the bottom of the viewport, similar to Spotify's player bar.

`src/store/playerStore.ts` (Zustand store):
- currentTrack: Track | null
- isPlaying: boolean
- progress: number (0-1)
- duration: number (seconds)
- volume: number (0-1)
- queue: Track[]
- actions: play(track), pause(), resume(), next(), previous(), seek(position), setVolume(vol), addToQueue(track), clearQueue()

`src/components/player/Player.tsx` (Main player bar):
- Fixed bottom bar, full width, dark background (zinc-900/95 with backdrop blur)
- Left: track artwork (small), title, artist name
- Center: play/pause, previous, next, progress bar with time display
- Right: volume control, queue toggle
- The audio element uses the Audius streaming URL from `getStreamUrl(trackId)`
- Supports HTTP Range headers for seeking (Audius streaming endpoint supports this)
- Shows loading state while stream initializes
- Handles errors gracefully (track unavailable, network issues)

`src/components/player/ProgressBar.tsx`:
- Clickable/draggable progress bar
- Shows elapsed time / total time
- Buffered indicator

`src/components/player/QueuePanel.tsx`:
- Slide-up panel showing upcoming tracks
- Drag to reorder (optional for MVP — skip if complex)
- Click to jump to track

`src/hooks/usePlayer.ts`:
- Connects Zustand store to the HTML5 Audio API
- Handles all audio events (timeupdate, ended, error, loadstart, canplay)
- Auto-advances to next track in queue when current track ends

Wire the player into the root layout so it persists across page navigation. Update the TrackCard and track detail page to call the play action when clicked.

Critical: The audio element's src should be the Audius streaming URL. Test that actual audio plays from the Audius streaming endpoint. The URL format is the result of `getStreamUrl(trackId)` from our abstraction layer.

Test by running `npm run dev`, clicking a track, and verifying audio plays with working controls.
```

---

## PROMPT 4 — Supabase Database Setup

```
[DECISION NEEDED: You'll need to create a Supabase project at supabase.com and provide the project URL and anon key]

Set up Supabase for our backend. Create `src/lib/supabase.ts` with the client initialization.

Create a migration file at `supabase/migrations/001_initial_schema.sql` with this schema:

Table: users
- id: uuid (primary key, default gen_random_uuid())
- email: text (nullable, from OAuth)
- audius_id: text (nullable, unique) — their Audius user ID
- audius_handle: text (nullable)
- patreon_id: text (nullable, unique) — their Patreon user ID
- patreon_tier: text (nullable) — e.g. 'free', 'supporter', 'premium'
- display_name: text
- avatar_url: text (nullable)
- last_login_at: timestamptz (nullable) — for retention analytics
- created_at: timestamptz (default now())
- updated_at: timestamptz (default now())
- Add unique constraint: at least one of audius_id or patreon_id must be non-null

Table: content_access
- id: uuid (primary key)
- audius_track_id: text (not null) — the Audius track ID
- access_tier: text (not null, check in ('public', 'authenticated', 'patron'))
- content_type: text (not null, default 'track', check in ('track', 'demo', 'wip', 'live_performance')) — what kind of content this is
- section: text (not null, default 'main', check in ('main', 'dreampeace', 'heavydevy'))
- display_order: integer (nullable, for custom sorting)
- featured: boolean (default false)
- display_title: text (nullable) — override title for special content (e.g. "Kingdom Demo - Early Take")
- notes: text (nullable) — admin notes about the track
- created_at: timestamptz (default now())
- updated_at: timestamptz (default now())
- Add unique constraint on audius_track_id

Table: play_events
- id: uuid (primary key)
- user_id: uuid (nullable, references users — null for anonymous plays)
- audius_track_id: text (not null)
- started_at: timestamptz (not null, default now())
- duration_seconds: integer (not null, default 0) — how long they actually listened
- listened_percentage: numeric(5,2) (default 0) — exact % of track listened (for granular reward rules)
- completed: boolean (default false) — did they listen to >90% of the track
- seek_count: integer (default 0) — how many times they seeked (engagement signal)
- source: text (default 'web') — for future: web, mobile, embed
- device_type: text (default 'desktop') — desktop, mobile, tablet
- session_id: text (nullable) — group plays in a session for analytics

Table: linked_accounts
- id: uuid (primary key)
- user_id: uuid (references users, not null)
- provider: text (not null, check in ('audius', 'patreon'))
- provider_id: text (not null)
- provider_data: jsonb (nullable) — raw OAuth profile data
- linked_at: timestamptz (default now())
- Unique constraint on (provider, provider_id)

Create Row Level Security policies (be explicit with these):
- users: SELECT where id = auth.uid(); UPDATE where id = auth.uid()
- content_access: SELECT for all (public read); INSERT/UPDATE/DELETE for service_role only
- play_events: INSERT for all (including anonymous); SELECT where user_id = auth.uid() OR user_id IS NULL
- linked_accounts: SELECT where user_id = auth.uid(); INSERT where user_id = auth.uid()

Create indexes:
- play_events(audius_track_id, started_at) for analytics queries
- play_events(user_id, started_at) for user history
- play_events(completed) for completion rate queries
- play_events(session_id) for session grouping
- content_access(access_tier) for tier filtering
- content_access(section) for section filtering
- content_access(section, access_tier) compound index for filtered queries
- content_access(content_type) for content type filtering

Also create a seed script at `scripts/seed-content.ts` that:
1. Reads the artist data from scripts/artist-data.json
2. Inserts content_access rows for each track — default all to 'public' tier, 'main' section
3. Marks the first 3 tracks as 'authenticated' tier (for testing gating)
4. Marks the next 2 tracks as 'patron' tier (for testing patron gating)
5. Marks any tracks with "ambient" or "chill" in the genre/mood as 'dreampeace' section

Create .env.local with placeholders:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

Run the migration and seed script, then verify the data exists.
```

---

## PROMPT 5 — Authentication (Audius OAuth + Patreon OAuth)

```
[DECISION NEEDED: You'll need Audius developer app credentials from Settings > Manage Your Apps on audius.co, and Patreon OAuth client credentials from patreon.com/portal/registration/register-clients]

Implement dual OAuth authentication using NextAuth.js v5 (the App Router compatible version).

`src/app/api/auth/[...nextauth]/route.ts`:

Set up two custom OAuth providers:

1. Audius OAuth Provider:
   - Authorization URL: https://audius.co/oauth/auth
   - The flow opens a popup, user logs in, Audius returns a JWT token
   - The JWT contains: userId, email, name, handle, profilePicture
   - Verify the JWT by calling the Audius verify_token endpoint
   - On successful auth: upsert user in Supabase (create if new, update if existing)
   - Store audius_id, audius_handle, display_name, avatar_url, email

2. Patreon OAuth Provider:
   - Authorization URL: https://www.patreon.com/oauth2/authorize
   - Token URL: https://www.patreon.com/api/oauth2/token
   - Scopes: identity, identity[email], campaigns.members
   - After token exchange, fetch /api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers
   - On successful auth: upsert user in Supabase
   - Store patreon_id, patreon_tier (mapped from their membership data), email
   - Map Patreon tiers to our access levels (we'll need to configure this per-artist later)

Account Linking — explicit algorithm:
- When user authenticates with provider B while already logged in via provider A:
  1. Check if provider B's email matches any existing user record
  2. If email match found: merge into that user record, add linked_accounts row
  3. If no email match: add provider B's ID to the current user record, add linked_accounts row
  4. If user is NOT logged in and provider email matches existing user: log them in as that user
- Session tier resolution: session.tier = MAX(audius_tier, patreon_tier) across all linked accounts
  - Tier hierarchy: patron > authenticated > public (anonymous)
  - Either provider can grant any tier (Patreon membership = patron, Audius login = authenticated)
- Create `src/lib/auth-helpers.ts` with:
  - `upsertUserFromOAuth(provider, profileData)` — handles user creation/update with try/catch
  - `linkAccounts(currentUserId, provider, providerId, email)` — handles the linking algorithm above
  - `resolveSessionTier(userId)` — queries all linked accounts and returns the highest tier

`src/components/auth/LoginButton.tsx`:
- "Sign In" button in the navbar
- Opens a modal with two options: "Continue with Audius" and "Continue with Patreon"
- Show which accounts are linked in the user's profile dropdown

`src/components/auth/AuthGuard.tsx`:
- Wrapper component that checks session status
- If content requires authentication and user isn't logged in, show a blur overlay with "Sign in to listen" CTA
- If content requires patron tier and user doesn't have it, show "Available to Patreon supporters" with a link to the Patreon page

`src/hooks/useAuth.ts`:
- Exposes: session, user, isAuthenticated, isPatron, login(), logout(), linkAccount()

Update .env.local with:
AUDIUS_CLIENT_ID=your_audius_app_key
AUDIUS_CLIENT_SECRET=your_audius_app_secret
PATREON_CLIENT_ID=your_patreon_client_id
PATREON_CLIENT_SECRET=your_patreon_client_secret
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3000

Mock Auth for Development:
Create `src/lib/mock-auth.ts` that activates when NEXT_PUBLIC_MOCK_AUTH=true (dev only):
- Add a floating dev toolbar (bottom-right corner) with tier selector: Anonymous | Authenticated | Patron
- Clicking a tier sets a cookie that the auth middleware reads
- useAuth hook checks for mock cookie before checking real session
- Mock user has a fake Audius ID and display name ("Dev User")
- This lets you test all access tiers without real OAuth credentials
- The toolbar only renders when NEXT_PUBLIC_MOCK_AUTH=true

Test all three auth states: anonymous, authenticated (Audius), and patron (Patreon) — use mock mode first, then test with real credentials when available.
```

---

## PROMPT 6 — Content Access Gating

```
Build the access control middleware that connects authentication state to content visibility.

`src/lib/access.ts`:
- `getContentAccess(trackId: string)`: queries Supabase content_access table, returns the access tier and section for a track. Cache results for 5 minutes (use Next.js unstable_cache or a simple in-memory Map).
- `canUserAccess(userTier: string | null, contentTier: string)`: pure function that checks if a user's tier grants access.
  - null (anonymous) can access 'public' only
  - 'authenticated' can access 'public' + 'authenticated'
  - 'patron' can access everything
- `getAccessibleTracks(userId: string | null, section?: string)`: returns all tracks the user can access, filtered by section. Joins Audius track data with content_access table.

Update the catalog pages:

1. `src/app/(catalog)/page.tsx`:
   - Fetch content_access data alongside Audius track data
   - All tracks are VISIBLE in the catalog (discovery is always open)
   - Locked tracks show the lock icon overlay on their artwork
   - Locked tracks show the tier badge ("Sign in to listen" or "Patreon Exclusive")

2. `src/app/(catalog)/[trackId]/page.tsx`:
   - If user can't access: show full metadata but replace the play button with the appropriate CTA
   - Don't hide locked content — show it with a clear upgrade path

3. Update the player (src/store/playerStore.ts and usePlayer.ts):
   - Before playing a track, check access via canUserAccess
   - If access denied, don't play — instead trigger a toast notification with the upgrade CTA
   - When building a queue (e.g. "play all"), skip locked tracks and notify

4. `src/middleware.ts` (Next.js middleware):
   - Protect the streaming proxy route (if we add one)
   - For now, access control lives in the UI layer since we're using direct Audius streaming URLs (Option A)
   - Add a comment noting: "When migrating to Option C, move access checks here to gate actual stream URLs"

Create a simple admin API at `src/app/api/admin/content/route.ts`:
- PUT /api/admin/content — update a track's access tier and section
- Accepts: { audius_track_id, access_tier, section, featured, notes }
- Protected by a simple admin API key in env (ADMIN_API_KEY)
- This is a stopgap until we build the admin UI

Test by:
1. Viewing the catalog as anonymous — verify public tracks play, locked tracks show CTAs
2. Logging in — verify authenticated tracks unlock
3. Using the mock patron mode — verify all tracks unlock
```

---

## PROMPT 7 — Usage Tracking + Play Events Pipeline

```
Implement the play event tracking system — this is the "relationship database" that powers future rewards.

`src/app/api/events/route.ts` (POST):
- Accepts play event data: { audius_track_id, event_type, duration_seconds, session_id }
- event_type: 'play_start', 'play_end', 'play_heartbeat'
- If user is authenticated, attach user_id from session
- If anonymous, still record the event (user_id = null)
- Validate input, insert into play_events table
- For 'play_end' events: set completed = true if duration_seconds >= 90% of track duration
- Return 200 OK (fire-and-forget from client side)

`src/hooks/usePlayTracking.ts`:
- Integrates with the player store
- On play start: POST play_start event, store the event ID
- Every 30 seconds during playback: POST play_heartbeat with accumulated duration
- On track end or track change: POST play_end with final duration and completed flag
- Session scoping: generate a session_id (uuid) and store in sessionStorage. A session = one browser tab lifecycle (tab open to tab close). If sessionStorage already has an ID, reuse it. For logged-in users, prefix with user_id for dedup. Session expires after 30 min of inactivity (check last event timestamp).
- Use navigator.sendBeacon for play_end events on page unload (so they don't get lost)
- Track seek_count: increment a counter each time the user seeks. Send with play_end event.
- Detect device_type from user agent (desktop/mobile/tablet) and include in events.

`src/lib/analytics.ts` (server-side analytics queries):
- `getTrackPlayCounts(trackIds: string[])`: total plays per track
- `getTopTracks(limit: number, timeRange: 'day' | 'week' | 'month' | 'all')`: most played tracks
- `getUserListeningHistory(userId: string, limit: number)`: user's recent plays
- `getUserStats(userId: string)`: total listening time, unique tracks, completion rate
- `getTrackCompletionRate(trackId: string)`: what % of listeners finish the track

Wire the analytics into the UI:
- Track detail page: show play count (from our DB, not Audius)
- If we want to show "X people listening now" — query play_heartbeat events from last 60 seconds
- Don't expose user listening history publicly — that's for the admin/rewards system

Test by:
1. Playing several tracks
2. Checking the play_events table in Supabase for correct event data
3. Verifying heartbeats fire every 30 seconds
4. Verifying completed flag is set correctly
5. Running the analytics queries and confirming they return sensible data
```

---

## PROMPT 8 — Dreampeace Section

```
Build the Dreampeace section as a visually distinct experience within the same app. Dreampeace is an ambient/wellness music catalog that needs to feel like a separate space.

`src/app/(dreampeace)/dreampeace/page.tsx`:
- Server component that fetches tracks where section = 'dreampeace' from content_access
- Completely different visual language from the main catalog:
  - Light or very muted color palette (think: soft gradients, cream/sage/lavender)
  - Larger artwork, more whitespace, slower visual rhythm
  - No play counts or popularity metrics — this is about the listening experience, not numbers
- Track presentation: large artwork cards in a masonry or flowing grid
- Ambient category tags instead of genre/mood (e.g., "Focus", "Sleep", "Meditation", "Movement")
- Auto-play / continuous mode toggle — listeners should be able to start and let it flow

`src/app/(dreampeace)/dreampeace/layout.tsx`:
- Override the default dark theme with Dreampeace styling
- Different navbar variant (simpler, more minimal)
- "Return to [Artist] Catalog" link in nav

`src/components/dreampeace/AmbientCard.tsx`:
- Track card designed for the wellness aesthetic
- Shows artwork prominently, title subtle
- Hover effect: gentle scale + glow, not aggressive

`src/components/dreampeace/ContinuousPlayer.tsx`:
- Alternative player presentation for Dreampeace section
- Larger, more visual (big artwork, waveform visualization optional)
- Crossfade between tracks (if feasible — use Web Audio API for overlap)
- "Endless" mode that shuffles and loops the dreampeace catalog

Apply the same access control rules from the main catalog. Dreampeace tracks can have any access tier (public, authenticated, patron).

The root layout should detect whether we're in the dreampeace route group and apply the appropriate theme. Use CSS custom properties on the body so themes cascade naturally.

Test by navigating between the main catalog and Dreampeace — verify the visual transition feels like entering a different space.
```

---

## PROMPT 9 — Admin Interface

```
Build a lightweight admin page for managing content access tiers and sections. This is for DT's team to tag tracks after uploading them to Audius.

`src/app/admin/page.tsx`:
- Protected by a simple password check (use ADMIN_PASSWORD env var — proper admin auth is post-MVP)
- Shows a table of ALL tracks from the Audius artist account
- Each row shows: artwork thumbnail, track title, Audius ID, current access tier, current section, featured flag
- Inline editing: click a tier badge to cycle through public/authenticated/patron
- Inline editing: click section to cycle through main/dreampeace/heavydevy
- Toggle featured flag
- "Sync with Audius" button that fetches latest tracks and adds any new ones to content_access with default values (public, main)
- Bulk actions: select multiple tracks, change tier/section for all

`src/app/admin/analytics/page.tsx`:
- Dashboard showing:
  - Total plays (today, this week, all time)
  - Top 10 tracks by play count (with completion rates)
  - Unique listeners (today, this week)
  - Plays by tier (how many plays are from anonymous vs authenticated vs patron)
  - Plays by section (main vs dreampeace)
- Use the analytics functions from src/lib/analytics.ts
- Simple bar/line charts (use recharts or just styled divs for MVP)

`src/app/admin/layout.tsx`:
- Admin nav: Content Management | Analytics
- Show "Admin Mode" indicator
- Logout button

The admin interface doesn't need to be pretty — functional and clear is fine. Light theme is OK here since it's an internal tool.

Test by:
1. Logging into admin
2. Changing a track from public to patron tier
3. Verifying the catalog page reflects the change
4. Checking the analytics dashboard shows real data
```

---

## PROMPT 10 — Polish, Error Handling, and Responsive Design

```
This is the QA and polish pass. Go through the entire application and address:

**Responsive Design:**
- Mobile: single column layout, bottom player takes less height, hamburger menu
- Tablet: 2-column grid, slightly condensed player
- Desktop: full layout as designed
- The audio player must work well on mobile (touch-friendly progress bar, appropriate button sizes)

**Error Handling:**
- Audius API unavailable: show cached data if available, graceful error message if not
- Track fails to stream: show error in player, auto-skip to next in queue, retry once
- Auth flow fails: clear error messaging, retry button
- Supabase unavailable: play events queue locally and retry (use a simple array buffer)
- Network offline: show offline indicator, pause play event reporting

**Loading States:**
- Skeleton loaders for catalog pages (not spinners)
- Player shows buffering state when stream is loading
- Smooth transitions between loading and loaded states

**SEO and Meta:**
- Add proper meta tags to all pages (title, description, og:image)
- Track detail pages should have og:image set to the track artwork
- Dynamic sitemap at /sitemap.xml listing all public tracks

**Performance:**
- Use Next.js Image component for all artwork (with Audius image URLs)
- Implement ISR (Incremental Static Regeneration) for catalog pages — revalidate every 5 minutes
- Preload next track in queue for gapless playback
- Lazy load below-the-fold content

**Accessibility:**
- Keyboard controls for the player (space = play/pause, arrow keys = seek/volume)
- ARIA labels on all interactive elements
- Screen reader announces track changes
- Focus management in modals (auth modal, queue panel)

Run through every page and interaction manually. Fix anything that feels broken or unpolished.
```

---

## PROMPT 11 — Deployment

```
Set up production deployment.

**Vercel Deployment:**
1. Create a `vercel.json` if needed for any custom config
2. Ensure all env vars are documented in `.env.example`
3. Set up the environment variables list for Vercel:
   - NEXT_PUBLIC_AUDIUS_APP_NAME
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - AUDIUS_CLIENT_ID
   - AUDIUS_CLIENT_SECRET
   - PATREON_CLIENT_ID
   - PATREON_CLIENT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to production domain)
   - ADMIN_API_KEY
   - ADMIN_PASSWORD
   - NEXT_PUBLIC_MOCK_AUTH=false (always false in prod)

**Pre-deployment checklist:**
- All TypeScript errors resolved (run `npx tsc --noEmit`)
- ESLint passes (`npm run lint`)
- Build succeeds locally (`npm run build`)
- All environment variables documented
- Supabase RLS policies tested
- No hardcoded localhost URLs
- No exposed API secrets in client code

**Post-deployment:**
- Verify OAuth redirects work with production URLs
- Update OAuth callback URLs in Audius and Patreon developer dashboards
- Test streaming works from production domain
- Verify Supabase connection from Vercel
- Run through full user flow: browse → login → play gated track → verify event logged

Create a `README.md` with:
- Project overview
- Setup instructions (env vars, Supabase setup, Audius app registration)
- Development commands
- Deployment instructions
- Architecture overview (the diagram from the planning doc)
```

---

## Post-MVP: Prep for Option C Migration

When ready to move from Option A (security through routing) to Option C (Audius-native gating), here's what changes:

1. **Audius side**: Create a gating mechanism (e.g., "DT Supporter" token or badge that Patreon members receive)
2. **App side**: Replace direct Audius streaming URLs with a proxy route that verifies access before redirecting to the Audius stream
3. **Middleware**: Move access checks from UI layer to `src/middleware.ts` to gate actual stream URLs
4. **Content_access table**: Add a column for the native gating config (NFT collection address, token ID, etc.)
5. **The abstraction layer (`src/lib/audius.ts`)** is designed for this swap — the rest of the app doesn't know where streams come from

The key architectural decision we made (all Audius SDK calls go through `src/lib/audius.ts`, content access is a separate data layer in Supabase) means this migration is a backend change that doesn't touch the UI.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/audius.ts` | All Audius API calls (the only file that imports @audius/sdk) |
| `src/lib/access.ts` | Content access control logic |
| `src/lib/supabase.ts` | Database client |
| `src/lib/types.ts` | Shared TypeScript types |
| `src/store/playerStore.ts` | Audio player state (Zustand) |
| `src/hooks/usePlayer.ts` | Player ↔ Audio API bridge |
| `src/hooks/usePlayTracking.ts` | Usage event pipeline |
| `src/middleware.ts` | Route protection (prep for Option C) |
| `supabase/migrations/` | Database schema |
| `scripts/find-artist.ts` | Artist discovery utility |
| `scripts/seed-content.ts` | Database seeder |
