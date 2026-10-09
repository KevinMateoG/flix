import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND || 'http://localhost:3000';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const headers = new Headers(options.headers);
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Origin')) {
    headers.set('Origin', process.env.NEXT_PUBLIC_URL || 'http://localhost:5173');
  }

  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  // Handle empty responses
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}
