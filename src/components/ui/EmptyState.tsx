import * as React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-surface-container/30 border-surface-bright/50 mx-auto my-8 flex max-w-md flex-col items-center justify-center rounded-lg border p-8 text-center',
        className,
      )}
      {...props}
    >
      <div className="bg-surface-container text-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <FolderOpen size={24} className="opacity-60" />
      </div>
      <h3 className="text-headline-sm text-on-background mb-2 font-semibold">{title}</h3>
      <p className="text-body-sm text-muted mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
