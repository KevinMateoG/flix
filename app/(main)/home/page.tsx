import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentRow } from '@/components/home/ContentRow';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatchingRow } from '@/components/home/ContinueWatchingRow';
import { getContinueWatching } from '@/app/actions/watch-history';
import { getMessages, getTmdbLanguage } from '@/lib/i18n';
import {
  isDemoModeActive,
  getPlayableMoviesForRegion,
  fetchTmdbDetails,
} from '@/lib/region-access';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: Props) {
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);
  const t = getMessages(profile?.language);

  const resolvedParams = await searchParams;
  const isDemo = isDemoModeActive(resolvedParams);

  const continueWatching = profile ? await getContinueWatching(profile.id) : [];

  // ── REGION-RESTRICTED MODE ──────────────────────────────────────────────────
  if (!isDemo) {
    const playableContent = await getPlayableMoviesForRegion(region);

    if (playableContent.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 px-4 pt-32 pb-12 text-center md:px-12">
          <h2 className="text-display-sm text-on-background">
            No hay contenido disponible en tu región todavía
          </h2>
          <p className="text-body-lg text-muted mt-2">
            Tu región actual es: <strong>{region}</strong>
          </p>
        </div>
      );
    }

    // Fetch TMDB metadata for each playable ID (auto-detects movie vs TV)
    const tmdbItems = await Promise.all(
      playableContent.map((item) => fetchTmdbDetails(item.tmdb_id, language)),
    );

    const validItems = tmdbItems.filter(Boolean) as any[];
    const hero = validItems.find((r) => r.backdrop_path) || validItems[0];

    return (
      <div className="flex flex-col gap-12 pb-12">
        {hero && (
          <HeroSection
            title={hero.title || hero.name}
            overview={hero.overview}
            backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
            tmdbId={hero.id}
            mediaType={hero.media_type || 'movie'}
            profileId={profile?.id}
            detailsUrl={`/${hero.media_type || 'movie'}/${hero.id}`}
          />
        )}

        {continueWatching && continueWatching.length > 0 && (
          <ContinueWatchingRow items={continueWatching} title={t.continueWatching} />
        )}

        <ContentRow
          title="Available in your Region"
          items={validItems}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={false}
        />
      </div>
    );
  }

  // ── DEMO MODE — full unfiltered TMDB catalog ────────────────────────────────
  const [trending, popularMovies, popularTV, topRated] = await Promise.all([
    tmdb.trending('all', 'week', language),
    tmdb.popular('movie', 1, region, language),
    tmdb.popular('tv', 1, region, language),
    tmdb.topRated('movie', 1, region, language),
  ]);

  const hero =
    trending.results?.find((r: any) => r.media_type === 'movie' && r.backdrop_path) ||
    trending.results?.[0];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {hero && (
        <HeroSection
          title={hero.title || hero.name}
          overview={hero.overview}
          backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
          tmdbId={hero.id}
          mediaType={hero.media_type || 'movie'}
          profileId={profile?.id}
          detailsUrl={`/${hero.media_type || 'movie'}/${hero.id}?demoMode=all`}
        />
      )}

      {continueWatching && continueWatching.length > 0 && (
        <ContinueWatchingRow items={continueWatching} title={t.continueWatching} />
      )}

      <ContentRow
        title={t.trendingThisWeek}
        items={trending.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.popularMovies}
        items={popularMovies.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.popularTvShows}
        items={popularTV.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.topRatedMovies}
        items={topRated.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />
    </div>
  );
}
