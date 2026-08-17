import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentDetail } from '@/components/movie/ContentDetail';
import { SeasonSelector } from '@/components/movie/SeasonSelector';
import { EpisodeList } from '@/components/movie/EpisodeList';
import { CastCrew } from '@/components/movie/CastCrew';
import { ContentRow } from '@/components/home/ContentRow';
import { notFound } from 'next/navigation';
import { getTmdbLanguage } from '@/lib/i18n';
import { isDemoModeActive, isTitlePlayableInRegion } from '@/lib/region-access';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TVDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const isDemo = isDemoModeActive(resolvedParams);
  const seasonParam = resolvedParams.season as string | undefined;

  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);

  const isPlayable = await isTitlePlayableInRegion(Number(id), region);

  let tv;
  let providers;
  try {
    [tv, providers] = await Promise.all([
      tmdb.tvDetails(Number(id), language),
      tmdb.providers('tv', Number(id)),
    ]);
  } catch (err) {
    console.error('Error loading TV detail:', err);
    notFound();
  }

  if (!tv || !tv.id) notFound();

  // Find the selected season number, defaulting to the first season in list
  const validSeasons = tv.seasons?.filter((s: any) => s.season_number > 0) || [];
  const defaultSeason = validSeasons[0]?.season_number || tv.seasons?.[0]?.season_number || 1;
  const seasonNumber = seasonParam ? Number(seasonParam) : defaultSeason;

  let seasonData = { episodes: [] };
  try {
    seasonData = await tmdb.seasonDetails(Number(id), seasonNumber, language);
  } catch (err) {
    console.error(`Error loading TV season ${seasonNumber} detail:`, err);
  }

  const providersByRegion = providers?.results?.[region];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={tv}
        mediaType="tv"
        providers={providersByRegion}
        tmdb={tmdb}
        profileId={profile?.id}
        showPlayButton={isDemo || isPlayable}
      />

      {tv.seasons && tv.seasons.length > 0 && (
        <>
          <SeasonSelector seasons={tv.seasons} currentSeason={seasonNumber} />
          <EpisodeList
            episodes={seasonData?.episodes || []}
            tmdbId={Number(id)}
            seasonNumber={seasonNumber}
            profileId={profile?.id}
            tmdb={tmdb}
            videos={tv.videos?.results || []}
            showPlayButton={isDemo || isPlayable}
          />
        </>
      )}

      <CastCrew cast={tv.credits?.cast || []} tmdb={tmdb} />

      {tv.recommendations?.results && tv.recommendations.results.length > 0 && (
        <ContentRow
          title="Similar Titles"
          items={tv.recommendations.results}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={isDemo}
        />
      )}
    </div>
  );
}
