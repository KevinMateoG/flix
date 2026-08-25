import { createClient } from '@/lib/supabase/server';
import { getActiveProfile } from '@/lib/auth';
import { tmdb } from '@/lib/tmdb';

/**
 * Matches the actual `playable_content` table schema.
 * Columns: tmdb_id, mux_playback_id, mux_asset_id, available_regions
 */
export type PlayableContent = {
  tmdb_id: number;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
  available_regions: string[];
};

export async function getUserRegion(): Promise<string> {
  const profile = await getActiveProfile();
  return profile?.region || 'US';
}

export function isDemoModeActive(
  searchParams: { [key: string]: string | string[] | undefined } | null,
): boolean {
  if (!searchParams) return false;
  return searchParams.demoMode === 'all';
}

export async function getPlayableMoviesForRegion(region: string): Promise<PlayableContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playable_content')
    .select('*')
    .contains('available_regions', [region]);

  if (error) {
    console.error('Error fetching playable content for region:', error);
    return [];
  }
  return (data || []) as PlayableContent[];
}

export async function isTitlePlayableInRegion(tmdbId: number, region: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playable_content')
    .select('tmdb_id')
    .eq('tmdb_id', tmdbId)
    .contains('available_regions', [region])
    .maybeSingle();

  if (error) {
    console.error('Error checking title playability:', error);
    return false;
  }
  return !!data;
}

/**
 * Given a tmdb_id (where we don't know if it's a movie or TV show),
 * try movieDetails first; if that 404s, try tvDetails.
 * Returns the TMDB detail object with a `media_type` field attached.
 */
export async function fetchTmdbDetails(
  tmdbId: number,
  language?: string,
): Promise<(any & { media_type: 'movie' | 'tv' }) | null> {
  try {
    const movie = await tmdb.movieDetails(tmdbId, language);
    if (movie && movie.id) {
      return { ...movie, media_type: 'movie' as const };
    }
  } catch {
    // Not a movie — try TV
  }

  try {
    const tv = await tmdb.tvDetails(tmdbId, language);
    if (tv && tv.id) {
      return { ...tv, media_type: 'tv' as const };
    }
  } catch {
    // Not found as either
  }

  return null;
}
