'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallback?: React.ReactNode;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);

  if (error || !src) {
    return (
      fallback || (
        <div
          className={cn(
            'bg-surface-container text-muted flex h-full w-full items-center justify-center',
            className,
          )}
        >
          <Film size={40} className="opacity-30" />
        </div>
      )
    );
  }

  return (
    <Image src={src} alt={alt} className={className} onError={() => setError(true)} {...props} />
  );
}
