import { tmdb } from '../lib/tmdb';

async function test() {
  console.log('Testing TMDB...');

  const trending = await tmdb.trending('movie', 'week');
  console.log('Trending:', trending.results?.length, 'results');
  console.log('First trending movie:', trending.results?.[0]?.title || trending.results?.[0]?.name);

  const search = await tmdb.search('Inception');
  console.log('Search:', search.results?.length, 'results');

  const movie = await tmdb.movieDetails(27205); // Inception
  console.log('Movie details:', movie.title, movie.genres?.map((g: any) => g.name).join(', '));

  const providers = await tmdb.providers('movie', 27205);
  console.log('Providers US:', Object.keys(providers.results?.US || {}));

  console.log('✅ TMDB working!');
}

test().catch(console.error);
