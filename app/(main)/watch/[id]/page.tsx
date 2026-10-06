import { getActiveProfile } from '@/lib/auth';
import { MuxPlayerComponent } from '@/components/player/MuxPlayer';
import { YouTubePlayerComponent } from '@/components/player/YouTubePlayer';
import { fetchApi } from '@/lib/api';
import { tmdb } from '@/lib/tmdb';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTmdbLanguage } from '@/lib/i18n';

interface Props {
  params: Promise<{ id: string }>; // id corresponds to Mux playbackId
  searchParams: Promise<{ tmdbId: string; type: string; season?: string; episode?: string }>;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id: rawPlaybackId } = await params;
  const playbackId = decodeURIComponent(rawPlaybackId);
  const { tmdbId, type, season, episode } = await searchParams;

  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }
  const language = getTmdbLanguage(profile.language);

  if (!tmdbId || !type) {
    redirect('/home');
  }

  const isTv = type === 'tv';
  const backUrl = isTv ? `/tv/${tmdbId}${season ? `?season=${season}` : ''}` : `/movie/${tmdbId}`;

  const youtubeVideoId = playbackId.startsWith('youtube:')
    ? playbackId.slice('youtube:'.length)
    : playbackId.startsWith('youtube%3A')
      ? playbackId.slice('youtube%3A'.length)
      : null;

  if (youtubeVideoId && !/^[a-zA-Z0-9_-]{11}$/.test(youtubeVideoId)) {
    redirect(backUrl);
  }

  // Fetch initial resume progress from watch_history
  const seasonNum = season ? Number(season) : 0;
  const epNum = episode ? Number(episode) : 0;

  let initialTime = 0;
  try {
    const history = await fetchApi(`/api/watch-history/${tmdbId}/season/${seasonNum}`);
    if (history && Array.isArray(history)) {
      const match = history.find((row: any) => row.episodeNumber === epNum);
      if (match) {
        initialTime = match.progressSeconds || 0;
      }
    }
  } catch (err) {
    console.error('Error fetching initial watch progress:', err);
  }

  // Fetch title and poster path for metadata
  let title = 'Video';
  let posterPath = '';

  try {
    if (isTv) {
      const show = await tmdb.tvDetails(Number(tmdbId), language);
      title = show.name || 'TV Show';
      posterPath = show.poster_path || '';
      if (seasonNum !== null && epNum !== null) {
        title = `${title} (S${seasonNum}:E${epNum})`;
      }
    } else {
      const movie = await tmdb.movieDetails(Number(tmdbId), language);
      title = movie.title || 'Movie';
      posterPath = movie.poster_path || '';
    }
  } catch (err) {
    console.error('Error fetching watch details:', err);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {youtubeVideoId ? (
        <YouTubePlayerComponent
          videoId={youtubeVideoId}
          profileId={profile.id}
          tmdbId={Number(tmdbId)}
          mediaType={type as 'movie' | 'tv'}
          title={title}
          posterPath={posterPath}
          seasonNumber={seasonNum !== null ? seasonNum : undefined}
          episodeNumber={epNum !== null ? epNum : undefined}
          initialTime={initialTime}
          backUrl={backUrl}
        />
      ) : (
        <MuxPlayerComponent
          playbackId={playbackId}
          profileId={profile.id}
          tmdbId={Number(tmdbId)}
          mediaType={type as 'movie' | 'tv'}
          title={title}
          posterPath={posterPath}
          seasonNumber={seasonNum !== null ? seasonNum : undefined}
          episodeNumber={epNum !== null ? epNum : undefined}
          initialTime={initialTime}
          backUrl={backUrl}
        />
      )}
    </div>
  );
}
