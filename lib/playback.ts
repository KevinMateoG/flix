const DEFAULT_TEST_PLAYBACK_ID = 'demo-stream';

export function getFallbackPlaybackId() {
  return process.env.NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID || DEFAULT_TEST_PLAYBACK_ID;
}

export function buildWatchUrl(
  playbackId: string | undefined | null,
  params: Record<string, string | number | undefined | null>,
) {
  const resolvedPlaybackId = playbackId || getFallbackPlaybackId();
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return `/watch/${resolvedPlaybackId}${query ? `?${query}` : ''}`;
}
