'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Info, Loader2, MoreVertical, Share2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { removeFromMyList } from '@/app/actions/my-list';

interface MyListCardProps {
  id: string;
  href: string;
  title: string;
  metadata: string;
  overview?: string;
  imageUrl?: string;
}

export function MyListCard({ id, href, title, metadata, overview, imageUrl }: MyListCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  async function handleRemove() {
    if (removing) return;

    setRemoving(true);
    try {
      await removeFromMyList(id);
    } catch (error) {
      console.error('Error removing from my list:', error);
      setRemoving(false);
    }
  }

  async function handleShare() {
    const url = new URL(href, window.location.origin).toString();
    const shareData = { title, text: title, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        console.error('Error sharing title:', error);
      }
    }
  }

  return (
    <>
      <article className={removing ? 'opacity-50' : undefined}>
        <div className="hover:bg-surface-container-low flex gap-3 rounded-md p-1 transition-colors">
          <Link
            href={href}
            className="bg-surface-container relative h-28 w-40 shrink-0 overflow-hidden rounded-sm sm:h-32 sm:w-52"
          >
            <ImageWithFallback
              src={imageUrl || ''}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 160px, 208px"
            />
          </Link>

          <div className="min-w-0 flex-1 self-center">
            <Link
              href={href}
              className="focus-visible:ring-on-background block rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <h2 className="text-body-lg text-on-background line-clamp-2 font-semibold">
                {title}
              </h2>
              {metadata && <p className="text-body-sm text-muted mt-1">{metadata}</p>}
            </Link>
          </div>

          <button
            type="button"
            aria-label={`Opciones para ${title}`}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="text-on-background hover:bg-surface-container-high focus-visible:ring-on-background flex h-11 w-9 shrink-0 items-center justify-center self-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <MoreVertical size={22} aria-hidden="true" />
          </button>
        </div>
      </article>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/65 p-0 sm:items-center sm:justify-center sm:p-6"
          role="presentation"
          onMouseDown={() => setMenuOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`my-list-title-${id}`}
            className="bg-surface w-full rounded-t-xl px-6 pt-3 pb-8 shadow-2xl sm:max-w-lg sm:rounded-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="bg-on-background/60 mx-auto mb-7 h-1 w-12 rounded-full" />
            <h2 id={`my-list-title-${id}`} className="text-headline-sm text-on-background">
              {title}
            </h2>
            {overview && <p className="text-body-lg text-on-background/80 mt-6">{overview}</p>}

            <div className="mt-7 flex flex-col gap-1">
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="text-body-lg text-on-background hover:bg-surface-container-high flex min-h-12 items-center gap-4 rounded-md px-1 text-left disabled:opacity-60"
              >
                {removing ? <Loader2 size={23} className="animate-spin" /> : <Check size={23} />}
                Quitar de Mi lista
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="text-body-lg text-on-background hover:bg-surface-container-high flex min-h-12 items-center gap-4 rounded-md px-1 text-left"
              >
                <Share2 size={23} />
                {copied ? 'Enlace copiado' : 'Compartir'}
              </button>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-body-lg text-on-background hover:bg-surface-container-high flex min-h-12 items-center gap-4 rounded-md px-1"
              >
                <Info size={23} />
                Más información
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
