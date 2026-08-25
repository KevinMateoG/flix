'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface SeasonSelectorProps {
  seasons: any[];
  currentSeason: number;
}

export function SeasonSelector({ seasons, currentSeason }: SeasonSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!seasons || seasons.length === 0) return null;

  // Filter out specials (usually season_number = 0) unless they want it,
  // but standard shows have seasons 1, 2...
  const filteredSeasons = seasons.filter((s) => s.season_number > 0);
  const displaySeasons = filteredSeasons.length > 0 ? filteredSeasons : seasons;

  const handleSeasonChange = (seasonNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', seasonNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-surface-bright/30 flex items-center gap-4 border-t px-4 pt-6 md:px-12">
      <label htmlFor="season-select" className="text-body-lg text-on-background font-semibold">
        Episodes
      </label>
      <div className="relative">
        <select
          id="season-select"
          value={currentSeason}
          onChange={(e) => handleSeasonChange(Number(e.target.value))}
          className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-10 cursor-pointer appearance-none rounded border pr-10 pl-4 focus:outline-none"
        >
          {displaySeasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name || `Season ${s.season_number}`} ({s.episode_count} Episodes)
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
