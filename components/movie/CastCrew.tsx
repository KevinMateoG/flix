import * as React from 'react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface CastCrewProps {
  cast: any[];
  tmdb: any;
}

export function CastCrew({ cast, tmdb }: CastCrewProps) {
  if (!cast || cast.length === 0) return null;

  // Show top 12 cast members
  const displayCast = cast.slice(0, 12);

  return (
    <div className="border-surface-bright/30 flex flex-col gap-4 border-t px-4 pt-6 md:px-12">
      <h3 className="text-headline-sm text-on-background">Cast</h3>
      <div className="scrollbar-thumb-surface-bright flex scrollbar-thin scrollbar-track-transparent gap-4 overflow-x-auto pb-4">
        {displayCast.map((actor) => {
          const avatarUrl = tmdb.image(actor.profile_path, 'w185');

          return (
            <div
              key={actor.id || actor.cast_id}
              className="flex w-[100px] shrink-0 flex-col gap-2 text-center md:w-[120px]"
            >
              {/* Profile Image */}
              <div className="border-surface-bright/40 bg-surface-container relative aspect-square w-full overflow-hidden rounded-full border shadow-md">
                <ImageWithFallback
                  src={avatarUrl || ''}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100px, 120px"
                />
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <p className="text-on-background truncate text-xs font-semibold">{actor.name}</p>
                <p className="text-muted mt-0.5 truncate text-[10px]">{actor.character}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
