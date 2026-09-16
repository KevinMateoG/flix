'use server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { normalizeLocale } from '@/lib/i18n';

export async function updateProfileRegion(region: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('profiles').update({ region }).eq('id', user.id);

  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set('user_region', region, {
    path: '/',
    maxAge: 2592000,
    sameSite: 'lax',
  });

  return { success: true };
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateFields: any = {};
  if (language !== undefined) updateFields.language = normalizeLocale(language);
  if (maturityRating !== undefined) updateFields.maturity_rating = maturityRating;
  if (isKids !== undefined) updateFields.is_kids = isKids;

  const { error } = await supabase.from('profiles').update(updateFields).eq('id', user.id);

  if (error) throw error;
  return { success: true };
}

export async function getActiveProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error || !data) return null;
  return data;
}
