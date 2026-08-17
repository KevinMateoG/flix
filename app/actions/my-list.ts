'use server';
import { createClient } from '@/lib/supabase/server';
import { getActiveProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleMyList({
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
    .from('my_list')
    .select('id')
    .eq('profile_id', profileId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('my_list').delete().eq('id', existing.id);
    if (error) throw error;
    return { added: false };
  } else {
    const { error } = await supabase.from('my_list').insert({
      profile_id: profileId,
      tmdb_id: tmdbId,
      media_type: mediaType,
    });
    if (error) throw error;
    return { added: true };
  }
}

export async function getMyList(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('my_list')
    .select('*')
    .eq('profile_id', profileId)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function removeFromMyList(listItemId: string) {
  const profile = await getActiveProfile();
  if (!profile) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('my_list')
    .delete()
    .eq('id', listItemId)
    .eq('profile_id', profile.id);

  if (error) throw error;

  revalidatePath('/my-list');
}

export async function checkIfInMyList({
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
    .from('my_list')
    .select('id')
    .eq('profile_id', profileId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
