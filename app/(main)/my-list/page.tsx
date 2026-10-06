import { getActiveProfile } from '@/lib/auth';
import { getMyList } from '@/app/actions/my-list';
import { tmdb } from '@/lib/tmdb';
import { MyListCard } from '@/components/movie/MyListCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { redirect } from 'next/navigation';
import { getTmdbLanguage } from '@/lib/i18n';

export default async function MyListPage() {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }
  const language = getTmdbLanguage(profile.language);

  let listItems = [];
  try {
    listItems = await getMyList(profile.id);
  } catch (err) {
    console.error('Error fetching my list:', err);
  }

  // Fetch TMDB details for each saved item in parallel
  const detailedItems = await Promise.all(
    listItems.map(async (item: any) => {
      try {
        let details;
        if (item.mediaType === 'tv') {
          details = await tmdb.tvDetails(item.tmdbId, language);
        } else {
          details = await tmdb.movieDetails(item.tmdbId, language);
        }
        return {
          ...item,
          title: details.title || details.name,
          poster_path: details.poster_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
          overview: details.overview,
        };
      } catch (err) {
        console.error(`Error loading TMDB details for watchlist item ${item.tmdbId}:`, err);
        return null;
      }
    }),
  );

  const validItems = detailedItems.filter(Boolean);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">My List</h1>

      {validItems.length === 0 ? (
        <EmptyState
          title="Your List is Empty"
          description="Explore movies and TV shows and click 'My List' to save them here for later."
          actionLabel="Browse Popular"
          actionHref="/browse"
        />
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {validItems.map((item: any) => {
            const href = `/${item.mediaType}/${item.tmdbId}`;
            const year = item.release_date
              ? new Date(item.release_date).getFullYear().toString()
              : '';
            const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : '';
            const metadata = [year, rating].filter(Boolean).join(' | ');

            const imageUrl = tmdb.image(item.poster_path, 'w342');

            return (
              <MyListCard
                key={item.id}
                id={item.id}
                href={href}
                title={item.title || 'Untitled'}
                metadata={metadata}
                overview={item.overview}
                imageUrl={imageUrl || undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
