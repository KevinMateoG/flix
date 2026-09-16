import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-surface-container-high animate-pulse rounded', className)} {...props} />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 rounded">
      <Skeleton className="aspect-[2/3] w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  );
}

export function ContentRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-12">
      <Skeleton className="h-6 w-48 rounded" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[140px] shrink-0 md:w-[200px]">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[60vh] w-full flex-col justify-end p-4 md:min-h-[80vh] md:p-12">
      <div className="flex max-w-xl flex-col gap-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-10 w-64 rounded md:h-12 md:w-96" />
        <Skeleton className="h-20 w-full rounded" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-32 rounded" />
          <Skeleton className="h-12 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
