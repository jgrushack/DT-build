#!/usr/bin/env tsx
/**
 * Seed script for content_access table
 * 
 * Reads artist data from scripts/artist-data.json and populates
 * the content_access table with appropriate access tiers and sections.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   npx tsx scripts/seed-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load artist data
const artistDataPath = path.join(__dirname, 'artist-data.json');
const artistData = JSON.parse(fs.readFileSync(artistDataPath, 'utf-8'));

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SECRET_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

type AccessTier = 'public' | 'authenticated' | 'patron';
type Section = 'main' | 'dreampeace' | 'heavydevy';
type ContentType = 'track' | 'demo' | 'wip' | 'live_performance';

interface ContentAccessRecord {
    audius_track_id: string;
    access_tier: AccessTier;
    content_type: ContentType;
    section: Section;
    featured: boolean;
    display_order: number;
    display_title?: string;
    notes?: string;
}

async function seedContent() {
    console.log('🌱 Starting content seed...\n');

    const tracks = artistData.tracks || [];
    if (tracks.length === 0) {
        console.error('❌ No tracks found in artist-data.json');
        process.exit(1);
    }

    console.log(`📊 Found ${tracks.length} tracks to seed\n`);

    const contentRecords: ContentAccessRecord[] = [];

    tracks.forEach((track: any, index: number) => {
        const trackId = track.id;
        const genre = (track.genre || '').toLowerCase();
        const mood = (track.mood || '').toLowerCase();
        const title = track.title || '';

        // Determine access tier
        let accessTier: AccessTier = 'public';
        if (index < 3) {
            // First 3 tracks: authenticated tier (for testing)
            accessTier = 'authenticated';
        } else if (index < 5) {
            // Next 2 tracks: patron tier (for testing)
            accessTier = 'patron';
        }

        // Determine section based on genre/mood
        let section: Section = 'main';
        if (genre.includes('ambient') || genre.includes('chill') || mood.includes('ambient') || mood.includes('chill')) {
            section = 'dreampeace';
        }

        // Determine content type (default to 'track')
        let contentType: ContentType = 'track';
        if (title.toLowerCase().includes('demo')) {
            contentType = 'demo';
        } else if (title.toLowerCase().includes('wip') || title.toLowerCase().includes('work in progress')) {
            contentType = 'wip';
        } else if (title.toLowerCase().includes('live')) {
            contentType = 'live_performance';
        }

        // Feature the first track
        const featured = index === 0;

        contentRecords.push({
            audius_track_id: trackId,
            access_tier: accessTier,
            content_type: contentType,
            section,
            featured,
            display_order: index,
            notes: `Imported from Audius (${track.playCount?.toLocaleString() || 0} plays)`,
        });

        // Log what we're inserting
        const emoji = accessTier === 'public' ? '🌍' : accessTier === 'authenticated' ? '🔒' : '⭐';
        console.log(
            `${emoji} ${title.padEnd(40)} | ${accessTier.padEnd(13)} | ${section.padEnd(10)} | ${contentType}`
        );
    });

    console.log(`\n💾 Inserting ${contentRecords.length} content records...\n`);

    // Insert records (upsert to handle re-runs)
    const { data, error } = await supabase
        .from('content_access')
        .upsert(contentRecords, {
            onConflict: 'audius_track_id',
            ignoreDuplicates: false,
        });

    if (error) {
        console.error('❌ Error inserting content:', error);
        process.exit(1);
    }

    console.log('✅ Content seeded successfully!\n');

    // Summary stats
    const publicCount = contentRecords.filter((r) => r.access_tier === 'public').length;
    const authCount = contentRecords.filter((r) => r.access_tier === 'authenticated').length;
    const patronCount = contentRecords.filter((r) => r.access_tier === 'patron').length;
    const dreampeaceCount = contentRecords.filter((r) => r.section === 'dreampeace').length;

    console.log('📈 Summary:');
    console.log(`   🌍 Public: ${publicCount}`);
    console.log(`   🔒 Authenticated: ${authCount}`);
    console.log(`   ⭐ Patron: ${patronCount}`);
    console.log(`   ✨ Dreampeace: ${dreampeaceCount}`);
    console.log('');
}

// Run seed
seedContent()
    .then(() => {
        console.log('🎉 Seed complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    });
