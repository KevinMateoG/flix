'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateWatchProgress({
  profileId,
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
  const supabase = await createClient();
  const completed = progressSeconds >= durationSeconds * 0.9;

  const updateFields: any = {
    profile_id: profileId,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    tmdb_id: tmdbId,
    media_type: mediaType,
    season_number: seasonNumber ?? 0,
    episode_number: episodeNumber ?? 0,
    progress_seconds: progressSeconds,
    duration_seconds: durationSeconds,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (title) updateFields.title = title;
  if (posterPath) updateFields.poster_path = posterPath;
  if (playbackId) updateFields.mux_playback_id = playbackId;

  const { error } = await supabase.from('watch_history').upsert(updateFields, {
    onConflict: 'profile_id,tmdb_id,media_type,season_number,episode_number',
  });

  if (error) throw error;
}

export async function getContinueWatching(profileId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('profile_id', profileId)
    .eq('completed', false)
    .gt('progress_seconds', 0)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
