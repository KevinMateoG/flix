'use server';
import { fetchApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function toggleDislike({
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  try {
    const data = await fetchApi('/api/dislikes/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    });
    return data || { added: false };
  } catch (error) {
    console.error('Error toggling dislike:', error);
    throw error;
  }
}

export async function checkIfDisliked({
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  try {
    const data = await fetchApi(`/api/dislikes/check?tmdbId=${tmdbId}&mediaType=${mediaType}`);
    return data?.disliked || false;
  } catch (error) {
    console.error('Error checking dislike:', error);
    return false;
  }
}

