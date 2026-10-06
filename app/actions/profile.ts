'use server';
import { fetchApi } from '@/lib/api';
import { cookies } from 'next/headers';
import { normalizeLocale } from '@/lib/i18n';

export async function updateProfileRegion(region: string) {
  try {
    await fetchApi('/api/profile/region', {
      method: 'POST',
      body: JSON.stringify({ region }),
    });

    const cookieStore = await cookies();
    cookieStore.set('user_region', region, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile region:', error);
    throw error;
  }
}

export async function updateProfileSettings({
  language,
  maturityRating,
  isKids,
}: {
  language?: string;
  maturityRating?: string;
  isKids?: boolean;
}) {
  try {
    const fields: any = {};
    if (language !== undefined) fields.language = normalizeLocale(language);
    if (maturityRating !== undefined) fields.maturityRating = maturityRating;
    if (isKids !== undefined) fields.isKids = isKids;

    await fetchApi('/api/profile/settings', {
      method: 'POST',
      body: JSON.stringify(fields),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }
}

export async function getActiveProfile() {
  try {
    const profile = await fetchApi('/api/profile');
    return profile || null;
  } catch (error) {
    return null;
  }
}
