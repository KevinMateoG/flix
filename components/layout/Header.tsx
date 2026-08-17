'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

export function Header({ className }: { className?: string }) {
  const headerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isDemoMode = searchParams.get('demoMode') === 'all';
  const getHref = (path: string) => (isDemoMode ? `${path}?demoMode=all` : path);

  const toggleDemoMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isDemoMode) {
      params.delete('demoMode');
    } else {
      params.set('demoMode', 'all');
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  useGSAP(
    () => {
      const hideAnim = gsap.to(headerRef.current, {
        yPercent: -100,
        paused: true,
        duration: 0.3,
        ease: 'power2.inOut',
      });

      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          // Only hide after scrolling down a bit (e.g. past 50px)
          if (self.scroll() > 50) {
            self.direction === 1 ? hideAnim.play() : hideAnim.reverse();
          } else {
            hideAnim.reverse();
          }
        },
      });
    },
    { scope: headerRef },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'bg-background/80 sticky top-0 z-50 flex h-16 items-center justify-between px-4 backdrop-blur-md md:px-12',
        className,
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/home" className="text-headline-md text-primary font-bold tracking-tighter">
          FLIX
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={getHref('/home')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('home')}
          </Link>
          <Link
            href={getHref('/browse')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('browse')}
          </Link>
          <Link
            href={getHref('/my-list')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('myList')}
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* DEMO MODE TOGGLE */}
        <button
          onClick={toggleDemoMode}
          className={cn(
            'hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:flex',
            isDemoMode
              ? 'bg-primary text-on-primary border-primary hover:bg-primary/90'
              : 'bg-surface-container text-muted border-surface-bright hover:text-on-background',
          )}
        >
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isDemoMode ? 'bg-on-primary animate-pulse' : 'bg-muted',
            )}
          />
          {isDemoMode ? 'Demo: ON' : 'Restricted: ON'}
        </button>

        <Link href="/search" className="text-on-background hover:text-primary transition-colors">
          <Search size={20} />
          <span className="sr-only">{t('search')}</span>
        </Link>
        <Link
          href="/profile"
          className="bg-surface-container hover:bg-surface-bright flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        >
          <User size={16} className="text-on-surface" />
          <span className="sr-only">{t('profile')}</span>
        </Link>
      </div>
    </header>
  );
}
