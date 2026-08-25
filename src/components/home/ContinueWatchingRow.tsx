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
          const progress = item.duration_seconds
            ? Math.floor((item.progress_seconds / item.duration_seconds) * 100)
            : 0;

          const remainingMin = item.duration_seconds
            ? Math.ceil((item.duration_seconds - item.progress_seconds) / 60)
            : 0;

          const isTv = item.media_type === 'tv';
          const subtitle = isTv
            ? `S${item.season_number}:E${item.episode_number} · ${remainingMin}m left`
            : `${remainingMin}m left`;

          // Generate play url with query parameters to resume
          const playUrl = buildWatchUrl(item.mux_playback_id, {
            tmdbId: item.tmdb_id,
            type: item.media_type,
            season: isTv ? item.season_number : undefined,
            episode: isTv ? item.episode_number : undefined,
          });

          const imageUrl = item.poster_path ? tmdb.image(item.poster_path, 'w342') : null;

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
