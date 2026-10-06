import { getActiveProfile } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

/**
 * Matches the actual `playable_content` table schema.
 */
export type PlayableContent = {
  tmdbId: number;
  muxPlaybackId: string | null;
  muxAssetId: string | null;
  availableRegions: string[];
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
  try {
    const data = await fetchApi(`/api/movies?region=${encodeURIComponent(region)}`);
    return (data || []) as PlayableContent[];
  } catch (error) {
    console.error('Error fetching playable content for region:', error);
    return [];
  }
}

export async function isTitlePlayableInRegion(tmdbId: number, region: string): Promise<boolean> {
  try {
    const data = await fetchApi(`/api/movies/${tmdbId}/playable?region=${encodeURIComponent(region)}`);
    return !!data?.playable;
  } catch (error) {
    console.error('Error checking title playability:', error);
    return false;
  }
}

/**
 * Given a tmdbId (where we don't know if it's a movie or TV show),
 * we call our backend proxy which handles trying movieDetails first then tvDetails.
 */
export async function fetchTmdbDetails(
  tmdbId: number,
  language?: string,
): Promise<(any & { media_type: 'movie' | 'tv' }) | null> {
  try {
    const data = await fetchApi(`/api/tmdb/details/${tmdbId}?language=${encodeURIComponent(language || 'en-US')}`);
    return data || null;
  } catch (err) {
    console.error(`Error fetching TMDB details for ${tmdbId}:`, err);
    return null;
  }
}

