import * as React from 'react';
import { Play } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Link from 'next/link';
import { buildWatchUrl } from '@/lib/playback';
import { fetchApi } from '@/lib/api';

interface EpisodeListProps {
  episodes: any[];
  tmdbId: number;
  seasonNumber: number;
  profileId?: string;
  tmdb: any;
  videos?: any[];
  showPlayButton?: boolean;
}

export async function EpisodeList({
  episodes,
  tmdbId,
  seasonNumber,
  profileId,
  tmdb,
  videos,
  showPlayButton = true,
}: EpisodeListProps) {
  if (!episodes || episodes.length === 0) return null;

  // Fetch watch history progress for these episodes if profile is present
  let watchProgressMap: Record<number, number> = {};

  if (profileId) {
    try {
      const history = await fetchApi(`/api/watch-history/${tmdbId}/season/${seasonNumber}`);

      if (history && Array.isArray(history)) {
        history.forEach((row: any) => {
          if (row.durationSeconds > 0) {
            watchProgressMap[row.episodeNumber] = Math.floor(
              (row.progressSeconds / row.durationSeconds) * 100,
            );
          }
        });
      }
    } catch (err) {
      console.error('Error loading watch progress in EpisodeList:', err);
    }
  }

  const youtubeVideos = (videos || []).filter(
    (v: any) => v.site?.toLowerCase() === 'youtube' && v.key,
  );
  const trailerKey =
    youtubeVideos.find((v: any) => v.type?.toLowerCase() === 'trailer')?.key ||
    youtubeVideos[0]?.key;
  const playbackId = trailerKey ? `youtube:${trailerKey}` : null;

  return (
    <div className="flex flex-col gap-6 px-4 md:px-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((episode) => {
          const episodeProgress = watchProgressMap[episode.episode_number];
          const imgUrl = tmdb.backdrop(episode.still_path, 'w780');
          const playUrl = buildWatchUrl(playbackId, {
            tmdbId,
            type: 'tv',
            season: seasonNumber,
            episode: episode.episode_number,
          });

          const cardContent = (
            <>
              {/* Thumbnail */}
              <div className="bg-surface-container border-surface-bright/35 relative aspect-[16/9] w-full overflow-hidden rounded border">
                <ImageWithFallback
                  src={imgUrl || ''}
                  alt={episode.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="bg-primary text-on-primary scale-90 transform rounded-full p-3 shadow-lg transition-transform duration-300 group-hover:scale-100">
                      <Play fill="currentColor" size={16} />
                    </div>
                  </div>
                )}

                {/* Progress bar overlay */}
                {episodeProgress !== undefined && (
                  <div className="absolute right-0 bottom-0 left-0 h-1.5 bg-black/40">
                    <div className="bg-primary h-full" style={{ width: `${episodeProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-body-sm text-on-background group-hover:text-primary line-clamp-1 font-semibold transition-colors">
                    {episode.episode_number}. {episode.name}
                  </h4>
                  {episode.runtime && (
                    <span className="text-muted bg-surface-container shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium">
                      {episode.runtime}m
                    </span>
                  )}
                </div>
                {episode.overview && (
                  <p className="text-muted mt-1.5 line-clamp-3 text-xs leading-relaxed">
                    {episode.overview}
                  </p>
                )}
              </div>
            </>
          );

          return showPlayButton ? (
            <Link
              key={episode.id}
              href={playUrl}
              className="group bg-surface-container/30 border-surface-bright/20 hover:bg-surface-container/50 flex cursor-pointer flex-col gap-3 rounded border p-3 transition-colors"
            >
              {cardContent}
            </Link>
          ) : (
            <div
              key={episode.id}
              className="bg-surface-container/30 border-surface-bright/20 flex flex-col gap-3 rounded border p-3 opacity-75"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

