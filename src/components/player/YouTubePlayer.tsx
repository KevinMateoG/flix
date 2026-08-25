'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { updateWatchProgress } from '@/app/actions/watch-history';

type YouTubePlayerInstance = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      width?: string | number;
      height?: string | number;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube Player API did not load'));
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="youtube.com/iframe_api"]',
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = (err) => {
        youtubeApiPromise = null;
        reject(err);
      };
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

interface YouTubePlayerProps {
  videoId: string;
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  backUrl: string;
}

export function YouTubePlayerComponent({
  videoId,
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath,
  seasonNumber,
  episodeNumber,
  initialTime = 0,
  backUrl,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let player: YouTubePlayerInstance | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let isCancelled = false;

    const saveProgress = (completed = false) => {
      if (!player) return;
      try {
        const durationSeconds = Math.floor(player.getDuration?.() || 0);
        if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

        const currentSecs = Math.floor(player.getCurrentTime?.() || 0);
        void updateWatchProgress({
          profileId,
          tmdbId,
          mediaType,
          title,
          posterPath,
          playbackId: `youtube:${videoId}`,
          seasonNumber,
          episodeNumber,
          progressSeconds: completed ? durationSeconds : currentSecs,
          durationSeconds,
        }).catch((error: unknown) => console.error('Error saving trailer progress:', error));
      } catch (err) {
        console.error('Error calculating YouTube progress:', err);
      }
    };

    const initPlayer = async () => {
      if (!containerRef.current) return;

      try {
        const YT = await loadYouTubeApi();
        if (isCancelled || !containerRef.current) return;

        // Reset container DOM node
        const mountPoint = document.createElement('div');
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(mountPoint);

        const playerVars: Record<string, string | number> = {
          autoplay: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          modestbranding: 1,
        };
        if (typeof window !== 'undefined' && window.location.origin) {
          playerVars.origin = window.location.origin;
        }

        player = new YT.Player(mountPoint, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars,
          events: {
            onReady: () => {
              if (isCancelled) return;
              if (initialTime > 0) {
                try {
                  player?.seekTo(initialTime, true);
                } catch {}
              }
              try {
                player?.playVideo();
              } catch {}
              heartbeat = setInterval(saveProgress, 15_000);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED) saveProgress(true);
            },
            onError: (err) => {
              console.warn('YouTube Player API Error event:', err);
              if (!isCancelled) setFailed(true);
            },
          },
        });
      } catch (error) {
        console.error('Unable to initialise YouTube player:', error);
        if (!isCancelled) setFailed(true);
      }
    };

    void initPlayer();

    return () => {
      isCancelled = true;
      if (heartbeat) clearInterval(heartbeat);
      saveProgress();
      if (player) {
        try {
          player.destroy();
        } catch {}
      }
    };
  }, [
    videoId,
    profileId,
    tmdbId,
    mediaType,
    title,
    posterPath,
    seasonNumber,
    episodeNumber,
    initialTime,
  ]);

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <div className="text-on-background flex items-center gap-3 px-4 py-3 md:px-6">
        <Link
          href={backUrl}
          className="rounded p-2 transition-colors hover:bg-white/10"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </Link>
        <p className="text-body-sm font-medium">{title}</p>
      </div>
      <div className="relative h-full min-h-0 w-full flex-1">
        <div
          ref={containerRef}
          className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
        />
        {failed && (
          <div className="text-body-sm absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
            <p className="text-muted max-w-md">
              This trailer cannot be embedded directly due to YouTube region or video owner playback
              restrictions.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-body-sm text-on-primary rounded-full px-5 py-2.5 font-semibold transition-opacity hover:opacity-90"
              >
                Watch on YouTube ↗
              </a>
              <Link
                href={backUrl}
                className="bg-surface-container-high text-body-sm text-on-surface hover:bg-surface-bright rounded-full px-5 py-2.5 font-medium transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
