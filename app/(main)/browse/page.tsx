import { tmdb } from "@/lib/tmdb";
import { getActiveProfile } from "@/lib/auth";
import { MovieCard } from "@/components/ui/MovieCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getTmdbLanguage } from "@/lib/i18n";
import { isDemoModeActive, getPlayableMoviesForRegion, fetchTmdbDetails } from "@/lib/region-access";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const genres = [
  { id: 'all', name: 'All' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
  { id: '27', name: 'Horror' },
  { id: '99', name: 'Documentary' },
];

export default async function BrowsePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const genre = (resolvedParams.genre as string) || 'all';
  const isDemo = isDemoModeActive(resolvedParams);

  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);

  let results: any[] = [];

  try {
    if (!isDemo) {
      const playableContent = await getPlayableMoviesForRegion(region);

      const tmdbItems = await Promise.all(
        playableContent.map((item) => fetchTmdbDetails(item.tmdb_id, language))
      );

      const validItems = tmdbItems.filter(Boolean);

      if (genre === 'all') {
        results = validItems;
      } else {
        results = validItems.filter(item =>
          item.genres?.some((g: any) => g.id.toString() === genre)
        );
      }
    } else {
      if (genre === 'all') {
        const data = await tmdb.popular('movie', 1, region, language);
        results = data.results || [];
      } else {
        const data = await tmdb.discover({ with_genres: genre, region, watch_region: region }, language);
        results = data.results || [];
      }
    }
  } catch (err) {
    console.error("Error fetching browse data:", err);
  }

  const getHref = (base: string) =>
    isDemo ? `${base}${base.includes('?') ? '&' : '?'}demoMode=all` : base;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
          Browse
        </h1>
      </div>

      {/* Categories Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-bright scrollbar-track-transparent">
        {genres.map((g) => {
          const isActive = genre === g.id;
          const basePath = `/browse${g.id === 'all' ? '' : `?genre=${g.id}`}`;
          const href = getHref(basePath);

          return (
            <Link key={g.id} href={href} className="shrink-0">
              <Button
                variant={isActive ? "primary" : "secondary"}
                size="sm"
                className="pointer-events-none"
              >
                {g.name}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {!isDemo && results.length === 0 && (
        <div className="flex flex-col gap-4 py-20 items-center justify-center text-center">
          <h2 className="text-display-sm text-on-background">No hay contenido disponible en tu región todavía</h2>
          <p className="text-body-lg text-muted">Tu región actual es: <strong>{region}</strong></p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((item: any) => {
          const itemTitle = item.title || item.name || "Untitled";
          const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
          const id = item.id;

          const year = item.release_date || item.first_air_date
            ? new Date(item.release_date || item.first_air_date).getFullYear().toString()
            : "";
          const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : "";
          const metadata = [year, rating].filter(Boolean).join(" | ");
          const imageUrl = tmdb.image(item.poster_path, "w342");
          const itemHref = getHref(`/${mediaType}/${id}`);

          return (
            <Link key={`${mediaType}-${id}`} href={itemHref}>
              <MovieCard
                title={itemTitle}
                metadata={metadata}
                imageUrl={imageUrl || undefined}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
