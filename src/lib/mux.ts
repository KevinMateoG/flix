import Mux from '@mux/mux-node';

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || '',
  tokenSecret: process.env.MUX_TOKEN_SECRET || '',
});

export async function getSignedPlaybackUrl(playbackId: string, expiresIn = 3600) {
  // Simplified for now, or if signed URLs are required, sign using jwt or mux-node
  // Since we're using public/signed playback IDs, return the standard Mux HLS streaming URL
  const domain = process.env.NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN || 'stream.mux.com';
  return `https://${domain}/${playbackId}.m3u8`;
}

export async function createDirectUpload() {
  const upload = await mux.video.uploads.create({
    new_asset_settings: { playback_policy: ['public'], test: false },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
  });
  return upload;
}
