# Supabase Database Setup

This guide walks through setting up the Supabase database for the Audius Artist Portal MVP.

## Prerequisites

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization, name, database password, region
   - Wait for project to initialize (~2 minutes)

2. **Get Your Project Credentials**
   - Go to Project Settings → API
   - Copy these values:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `Publishable key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `Secret key` → `SUPABASE_SECRET_KEY` ⚠️ **SECRET**

## Setup Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_... # SECRET - never commit!
```

### 2. Run the Database Migrations

Apply migrations in order:
- `supabase/migrations/001_initial_schema.sql` — users, content_access, play_events, linked_accounts
- `supabase/migrations/002_dreampeace_backend.sql` — listening_sessions, audius_track_cache, audius_album_cache, user_preferences

**Option A: Via Supabase Dashboard (Recommended for first-time)**
1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Paste the contents of `001_initial_schema.sql`, click **Run**
4. Repeat for `002_dreampeace_backend.sql`

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### 3. Verify Schema

In the Supabase dashboard:
1. Go to **Table Editor**
2. You should see 8 tables:
   - From `001`: `users`, `content_access`, `play_events`, `linked_accounts`
   - From `002`: `listening_sessions`, `audius_track_cache`, `audius_album_cache`, `user_preferences`

### 4. Run the Seed Script

Install `tsx` if you haven't:
```bash
npm install -D tsx
```

Add seed script to `package.json`:
```json
{
  "scripts": {
    "seed": "tsx scripts/seed-content.ts"
  }
}
```

Run the seed:
```bash
npm run seed
```

Expected output:
```
🌱 Starting content seed...

📊 Found 19 tracks to seed

🌍 Track Title                           | public        | main       | track
🔒 Track Title                           | authenticated | main       | track
🔒 Track Title                           | authenticated | main       | track
⭐ Track Title                           | patron        | main       | track
⭐ Track Title                           | patron        | main       | track
...

✅ Content seeded successfully!

📈 Summary:
   🌍 Public: 14
   🔒 Authenticated: 3
   ⭐ Patron: 2
   ✨ Dreampeace: 0
```

### 5. Verify Data

In Supabase Dashboard → Table Editor → `content_access`:
- Should see 19 rows (one per track)
- First 3 tracks should have `access_tier = 'authenticated'`
- Next 2 tracks should have `access_tier = 'patron'`
- Rest should be `'public'`

## Database Schema Overview

### Tables

#### `users`
Stores user accounts with OAuth provider linking.
- Links via `audius_id` and/or `patreon_id`
- Tracks `patreon_tier` for access control
- `last_login_at` for retention analytics

#### `content_access`
Defines which tracks are available and to whom.
- `access_tier`: `'public'` | `'authenticated'` | `'patron'`
- `section`: `'main'` | `'dreampeace'` | `'heavydevy'`
- `content_type`: `'track'` | `'demo'` | `'wip'` | `'live_performance'`
- `featured`: Boolean for homepage display

#### `play_events`
Tracks all playback for analytics.
- Supports anonymous plays (nullable `user_id`)
- Records `listened_percentage` and `completed` status
- Tracks `seek_count` for engagement metrics
- Groups via `session_id`

#### `linked_accounts`
Raw OAuth provider data for account linking.
- Stores `provider_data` as JSONB
- Enables Audius + Patreon account linking

## Row Level Security (RLS)

All tables have RLS enabled:

- **Users**: Can only view/edit their own profile
- **Content Access**: Public read, admin write
- **Play Events**: Anyone can insert, users can view their own
- **Linked Accounts**: Users can view/insert their own

## Troubleshooting

### "Missing environment variables" error
- Make sure `.env.local` exists and has all required variables
- Restart dev server after changing `.env.local`

### Migration fails with "relation already exists"
- Tables already exist - you can skip migration or drop tables first
- To drop: Run `DROP TABLE IF EXISTS users, content_access, play_events, linked_accounts CASCADE;` in SQL Editor

### Seed script fails
- Check that migration ran successfully
- Verify `scripts/artist-data.json` exists
- Make sure `SUPABASE_SECRET_KEY` is set in `.env.local`

## Next Steps

With the database set up, you can now:
1. ✅ Test content gating (Prompt 6)
2. ✅ Track play events (Prompt 7)
3. ✅ Build admin interface (Prompt 9)
