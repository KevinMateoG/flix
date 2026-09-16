import { tmdb } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';
import { getTmdbLanguage } from '@/lib/i18n';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    const language = getTmdbLanguage(req.nextUrl.searchParams.get('language'));
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const data = await tmdb.search(q.trim(), 1, language);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
