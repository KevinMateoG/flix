'use server';
import { fetchApi } from '@/lib/api';

export async function updateWatchProgress({
  tmdbId,
  mediaType,
  title,
  posterPath,
  playbackId,
  seasonNumber,
  episodeNumber,
  progressSeconds,
  durationSeconds,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  posterPath?: string;
  playbackId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
}) {
  try {
    await fetchApi('/api/watch-history/update-progress', {
      method: 'POST',
      body: JSON.stringify({
        tmdbId,
        mediaType,
        title,
        posterPath,
        playbackId,
        seasonNumber,
        episodeNumber,
        progressSeconds,
        durationSeconds,
      }),
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    throw error;
  }
}

export async function getContinueWatching(profileId: string, limit = 10) {
  try {
    const data = await fetchApi(`/api/watch-history?limit=${limit}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return [];
  }
}

