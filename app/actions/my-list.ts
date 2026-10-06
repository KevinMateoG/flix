'use server';
import { fetchApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function toggleMyList({
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  try {
    const data = await fetchApi('/api/my-list/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    });
    return data || { added: false };
  } catch (error) {
    console.error('Error toggling my list:', error);
    throw error;
  }
}

export async function getMyList(profileId: string) {
  try {
    const data = await fetchApi('/api/my-list');
    return data || [];
  } catch (error) {
    console.error('Error fetching my list:', error);
    return [];
  }
}

export async function removeFromMyList(listItemId: number) {
  try {
    await fetchApi(`/api/my-list/${listItemId}`, {
      method: 'DELETE',
    });
    revalidatePath('/my-list');
  } catch (error) {
    console.error('Error removing from my list:', error);
    throw error;
  }
}

export async function checkIfInMyList({
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  try {
    const data = await fetchApi(`/api/my-list/check?tmdbId=${tmdbId}&mediaType=${mediaType}`);
    return data?.inList || false;
  } catch (error) {
    console.error('Error checking my list:', error);
    return false;
  }
}

