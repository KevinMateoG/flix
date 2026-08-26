import * as React from 'react';
import Image from 'next/image';

interface WatchProvidersProps {
  providers?: {
    link?: string;
    flatrate?: any[];
    rent?: any[];
    buy?: any[];
  };
}

export function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers) return null;

  const { flatrate = [], rent = [], buy = [] } = providers;

  if (flatrate.length === 0 && rent.length === 0 && buy.length === 0) {
    return (
      <div className="text-body-sm text-muted mt-4 px-4 md:px-12">
        No regional streaming providers available.
      </div>
    );
  }

  const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

  const renderProviderGroup = (title: string, list: any[]) => {
    if (list.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        <h4 className="text-muted text-xs font-semibold tracking-wider uppercase">{title}</h4>
        <div className="flex flex-wrap gap-3">
          {list.map((provider) => (
            <div
              key={provider.provider_id}
              className="group bg-surface-container border-surface-bright/30 relative flex h-10 w-10 cursor-help overflow-hidden rounded border"
              title={provider.provider_name}
            >
              <Image
                src={`${TMDB_LOGO_BASE}${provider.logo_path}`}
                alt={provider.provider_name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border-surface-bright/30 flex flex-col gap-6 border-t px-4 pt-6 md:px-12">
      <h3 className="text-headline-sm text-on-background">Where to Watch</h3>
      <div className="flex flex-col gap-6 md:flex-row md:gap-12">
        {renderProviderGroup('Stream', flatrate)}
        {renderProviderGroup('Rent', rent)}
        {renderProviderGroup('Buy', buy)}
      </div>
      {providers.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-2 self-start text-xs font-medium hover:underline"
        >
          Provided by JustWatch
        </a>
      )}
    </div>
  );
}
