export const supportedLocales = ['en', 'es', 'pt'] as const;

export type AppLocale = (typeof supportedLocales)[number];

export function normalizeLocale(locale?: string | null): AppLocale {
  return supportedLocales.includes(locale as AppLocale) ? (locale as AppLocale) : 'en';
}

export function getTmdbLanguage(locale?: string | null) {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === 'es' ? 'es-ES' : normalizedLocale === 'pt' ? 'pt-BR' : 'en-US';
}

const messages = {
  en: {
    home: 'Home',
    browse: 'Browse',
    myList: 'My List',
    profile: 'Profile',
    search: 'Search',
    settings: 'Settings',
    trendingThisWeek: 'Trending This Week',
    popularMovies: 'Popular Movies',
    popularTvShows: 'Popular TV Shows',
    topRatedMovies: 'Top Rated Movies',
    continueWatching: 'Continue Watching',
    preferredLanguage: 'Preferred Language',
    maturityRating: 'Maturity Rating Filter',
    kidsProfile: 'Kids Profile',
    kidsProfileDescription: 'Restricts visibility to child-friendly content and ratings.',
    savePreferences: 'Save Preferences',
    cancel: 'Cancel',
  },
  es: {
    home: 'Inicio',
    browse: 'Explorar',
    myList: 'Mi lista',
    profile: 'Perfil',
    search: 'Buscar',
    settings: 'Configuración',
    trendingThisWeek: 'Tendencias de esta semana',
    popularMovies: 'Películas populares',
    popularTvShows: 'Series populares',
    topRatedMovies: 'Películas mejor valoradas',
    continueWatching: 'Continuar viendo',
    preferredLanguage: 'Idioma preferido',
    maturityRating: 'Filtro de clasificación por edad',
    kidsProfile: 'Perfil infantil',
    kidsProfileDescription: 'Restringe el contenido a títulos y clasificaciones aptos para niños.',
    savePreferences: 'Guardar preferencias',
    cancel: 'Cancelar',
  },
  pt: {
    home: 'Início',
    browse: 'Explorar',
    myList: 'Minha lista',
    profile: 'Perfil',
    search: 'Pesquisar',
    settings: 'Configurações',
    trendingThisWeek: 'Em alta esta semana',
    popularMovies: 'Filmes populares',
    popularTvShows: 'Séries populares',
    topRatedMovies: 'Filmes mais bem avaliados',
    continueWatching: 'Continuar assistindo',
    preferredLanguage: 'Idioma preferido',
    maturityRating: 'Filtro de classificação etária',
    kidsProfile: 'Perfil infantil',
    kidsProfileDescription:
      'Restringe a exibição a conteúdos e classificações adequados para crianças.',
    savePreferences: 'Salvar preferências',
    cancel: 'Cancelar',
  },
} as const;

export type TranslationKey = keyof (typeof messages)['en'];

export function getMessages(locale?: string | null) {
  return messages[normalizeLocale(locale)];
}
