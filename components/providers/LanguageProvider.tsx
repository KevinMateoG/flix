'use client';

import { createContext, useContext, useEffect } from 'react';
import { getMessages, normalizeLocale, type AppLocale, type TranslationKey } from '@/lib/i18n';

type LanguageContextValue = {
  locale: AppLocale;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  t: (key) => getMessages('en')[key],
});

export function LanguageProvider({
  locale,
  children,
}: {
  locale?: string | null;
  children: React.ReactNode;
}) {
  const normalizedLocale = normalizeLocale(locale);
  const messages = getMessages(normalizedLocale);

  useEffect(() => {
    document.documentElement.lang = normalizedLocale;
  }, [normalizedLocale]);

  return (
    <LanguageContext.Provider value={{ locale: normalizedLocale, t: (key) => messages[key] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
