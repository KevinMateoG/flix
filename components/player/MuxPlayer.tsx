'use client';

import { useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type MuxPlayerElement from '@mux/mux-player';
import { updateWatchProgress } from '@/app/actions/watch-history';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  playbackId: string;
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  onEnded?: () => void;
  backUrl: string;
}

export function MuxPlayerComponent({
  playbackId,
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath,
  seasonNumber,
  episodeNumber,
  initialTime = 0,
  onEnded,
  backUrl,
}: Props) {
  const playerRef = useRef<MuxPlayerElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const hasResumedRef = useRef(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    hasResumedRef.current = false;
    const resumePlayback = () => {
      if (initialTime <= 0 || hasResumedRef.current) return;
      const duration = Number(player.duration);
      player.currentTime =
        Number.isFinite(duration) && duration > 0
          ? Math.min(initialTime, Math.max(0, duration - 1))
          : initialTime;
      hasResumedRef.current = true;
    };

    resumePlayback();
    player.addEventListener('loadedmetadata', resumePlayback);

    const sendHeartbeat = async () => {
      if (player && !player.paused && !player.ended) {
        try {
          await updateWatchProgress({
            profileId,
            tmdbId,
            mediaType,
            title,
            posterPath,
            playbackId,
            seasonNumber,
            episodeNumber,
            progressSeconds: Math.floor(player.currentTime),
            durationSeconds: Math.floor(player.duration || 0),
          });
        } catch (err) {
          console.error('Error saving progress heartbeat:', err);
        }
      }
    };

    heartbeatRef.current = setInterval(sendHeartbeat, 15000);

    const handleEnded = async () => {
      try {
        await updateWatchProgress({
          profileId,
          tmdbId,
          mediaType,
          title,
          posterPath,
          playbackId,
          seasonNumber,
          episodeNumber,
          progressSeconds: Math.floor(player.duration || 0),
          durationSeconds: Math.floor(player.duration || 0),
        });
      } catch (err) {
        console.error('Error saving progress on ended:', err);
      }
      onEnded?.();
    };

    player.addEventListener('ended', handleEnded);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      sendHeartbeat();
      if (player) {
        player.removeEventListener('ended', handleEnded);
        player.removeEventListener('loadedmetadata', resumePlayback);
      }
    };
  }, [
    profileId,
    tmdbId,
    mediaType,
    title,
    posterPath,
    playbackId,
    seasonNumber,
    episodeNumber,
    initialTime,
    onEnded,
  ]);

  return (
    <div className="group relative h-full w-full bg-black">
      {/* Top back button visible on hover */}
      <div className="absolute top-0 right-0 left-0 z-50 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Link href={backUrl} className="text-on-background hover:text-primary transition-colors">
          <ArrowLeft size={32} />
        </Link>
        <div>
          <h2 className="text-headline-sm text-on-background font-semibold">{title}</h2>
          {seasonNumber !== undefined && episodeNumber !== undefined && (
            <p className="text-label-caps text-muted">
              S{seasonNumber}:E{episodeNumber}
            </p>
          )}
        </div>
      </div>

      <MuxPlayer
        ref={playerRef}
        {...(playbackId === 'demo-stream' || playbackId?.startsWith('http')
          ? { src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
          : { playbackId: playbackId })}
        metadata={{
          video_id: `tmdb_${tmdbId}`,
          video_title: title,
          video_type: mediaType,
          video_series_season: seasonNumber?.toString(),
          video_series_episode: episodeNumber?.toString(),
        }}
        streamType="on-demand"
        autoPlay
        className="h-full w-full object-contain"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
