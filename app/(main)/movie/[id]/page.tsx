import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentDetail } from '@/components/movie/ContentDetail';
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

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const isDemo = isDemoModeActive(resolvedParams);

  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);

  const isPlayable = await isTitlePlayableInRegion(Number(id), region);

  let movie;
  let providers;
  try {
    [movie, providers] = await Promise.all([
      tmdb.movieDetails(Number(id), language),
      tmdb.providers('movie', Number(id)),
    ]);
  } catch (err) {
    console.error('Error loading movie detail:', err);
    notFound();
  }

  if (!movie || !movie.id) notFound();

  const providersByRegion = providers?.results?.[region];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={movie}
        mediaType="movie"
        providers={providersByRegion}
        tmdb={tmdb}
        profileId={profile?.id}
        showPlayButton={isDemo || isPlayable}
      />
      <CastCrew cast={movie.credits?.cast || []} tmdb={tmdb} />
      {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
        <ContentRow
          title="Similar Titles"
          items={movie.recommendations.results}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={isDemo}
        />
      )}
    </div>
  );
}
