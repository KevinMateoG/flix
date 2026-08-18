import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { getActiveProfile } from '@/lib/auth';
import { Suspense } from 'react';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();

  return (
    <LanguageProvider locale={profile?.language}>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </div>
    </LanguageProvider>
  );
}
