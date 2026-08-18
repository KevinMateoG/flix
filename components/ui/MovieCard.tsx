import * as React from 'react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export interface MovieCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  metadata?: string;
  imageUrl?: string;
  progress?: number; // 0 to 100 for continue watching
}

export function MovieCard({
  className,
  title,
  metadata,
  imageUrl,
  progress,
  ...props
}: MovieCardProps) {
  return (
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col gap-2 rounded transition-transform hover:scale-[1.02]',
        className,
      )}
      {...props}
    >
      <div className="bg-surface-container relative aspect-[2/3] w-full overflow-hidden rounded hover:shadow-[0_0_15px_rgba(229,9,20,0.2)]">
        <ImageWithFallback
          src={imageUrl || ''}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {/* Progress Bar for Continue Watching */}
        {progress !== undefined && (
          <div className="bg-surface/50 absolute right-0 bottom-0 left-0 h-1">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h3 className="text-body-sm text-on-background truncate font-semibold">{title}</h3>
        {metadata && <p className="text-label-caps text-muted truncate">{metadata}</p>}
      </div>
    </div>
  );
}
