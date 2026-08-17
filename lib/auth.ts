import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getProfile(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function getActiveProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching active profile:', error);
    return null;
  }
}
