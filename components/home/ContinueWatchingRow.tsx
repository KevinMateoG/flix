import * as React from 'react';
import { MovieCard } from '@/components/ui/MovieCard';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { buildWatchUrl } from '@/lib/playback';

interface ContinueWatchingRowProps {
  items: any[];
  title?: string;
}

export function ContinueWatchingRow({
  items,
  title = 'Continue Watching',
}: ContinueWatchingRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 px-4 md:px-12">
      <h2 className="text-headline-sm text-on-background border-primary border-l-4 pl-3">
        {title}
      </h2>
      <div className="scrollbar-thumb-surface-bright flex scrollbar-thin scrollbar-track-transparent gap-4 overflow-x-auto pb-4">
        {items.map((item) => {
          const progress = item.durationSeconds
            ? Math.floor((item.progressSeconds / item.durationSeconds) * 100)
            : 0;

          const remainingMin = item.durationSeconds
            ? Math.ceil((item.durationSeconds - item.progressSeconds) / 60)
            : 0;

          const isTv = item.mediaType === 'tv';
          const subtitle = isTv
            ? `S${item.seasonNumber}:E${item.episodeNumber} · ${remainingMin}m left`
            : `${remainingMin}m left`;

          // Generate play url with query parameters to resume
          const playUrl = buildWatchUrl(item.muxPlaybackId, {
            tmdbId: item.tmdbId,
            type: item.mediaType,
            season: isTv ? item.seasonNumber : undefined,
            episode: isTv ? item.episodeNumber : undefined,
          });

          const imageUrl = item.posterPath ? tmdb.image(item.posterPath, 'w342') : null;

          return (
            <Link key={item.id} href={playUrl} className="w-[140px] shrink-0 md:w-[200px]">
              <MovieCard
                title={item.title || 'Untitled'}
                metadata={subtitle}
                imageUrl={imageUrl || undefined}
                progress={progress}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
