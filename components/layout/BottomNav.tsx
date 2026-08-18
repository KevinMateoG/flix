'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Compass, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const isDemoMode = searchParams.get('demoMode') === 'all';
  const getHref = (path: string) => (isDemoMode ? `${path}?demoMode=all` : path);

  const navItems = [
    { name: t('home'), href: '/home', icon: Home },
    { name: t('browse'), href: '/browse', icon: Compass },
    { name: t('myList'), href: '/my-list', icon: Bookmark },
    { name: t('profile'), href: '/profile', icon: User },
  ];

  return (
    <nav
      className={cn(
        'border-surface bg-background/90 pb-safe fixed right-0 bottom-0 left-0 z-50 border-t pt-2 backdrop-blur-md md:hidden',
        className,
      )}
    >
      <div className="flex items-center justify-around px-2 pb-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={getHref(item.href)}
              className={cn(
                'text-muted hover:text-on-background flex flex-col items-center gap-1 p-2 transition-colors',
                isActive && 'text-primary hover:text-primary',
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] leading-none font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
