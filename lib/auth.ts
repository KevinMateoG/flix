import { fetchApi } from './api';

export async function getUser(): Promise<any | null> {
  try {
    const data = await fetchApi('/api/auth/get-session');
    return data?.user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getProfile(userId: string) {
  // Since we only exposed /api/profile/me, we assume the requested profile is the active one,
  // or we need to add a generic profile fetching endpoint if really needed.
  // For the current usage, getActiveProfile handles what we need.
  return getActiveProfile();
}

export async function getActiveProfile() {
  try {
    const profile = await fetchApi('/api/profile/me');
    return profile || null;
  } catch (error) {
    console.error('Error fetching active profile:', error);
    return null;
  }
}
