'use server';
import { createClient } from '@/lib/supabase/server';
import { getActiveProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleDislike({
  profileId,
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('dislikes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('dislikes').delete().eq('id', existing.id);
    if (error) throw error;
    return { added: false };
  } else {
    const { error } = await supabase.from('dislikes').insert({
      profile_id: profileId,
      tmdb_id: tmdbId,
      media_type: mediaType,
    });
    if (error) throw error;
    return { added: true };
  }
}

export async function checkIfDisliked({
  profileId,
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dislikes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
