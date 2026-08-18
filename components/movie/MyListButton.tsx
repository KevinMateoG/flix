'use client';

import * as React from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toggleMyList, checkIfInMyList } from '@/app/actions/my-list';

interface MyListButtonProps {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function MyListButton({
  profileId,
  tmdbId,
  mediaType,
  variant = 'secondary',
  size = 'lg',
}: MyListButtonProps) {
  const [isInList, setIsInList] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let active = true;
    async function check() {
      try {
        const result = await checkIfInMyList({ profileId, tmdbId, mediaType });
        if (active) {
          setIsInList(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking list:', err);
        if (active) setLoading(false);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [profileId, tmdbId, mediaType]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    try {
      const res = await toggleMyList({ profileId, tmdbId, mediaType });
      setIsInList(res.added);
    } catch (err) {
      console.error('Error toggling list:', err);
    } finally {
      setToggling(false);
    }
  };

  if (!mounted || loading) {
    return (
      <Button variant={variant} size={size} disabled={true} className="gap-2">
        <Loader2 size={20} className="animate-spin" />
        List
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggling}
      className="gap-2"
    >
      {isInList ? (
        <>
          <Check size={20} className="text-primary" />
          In My List
        </>
      ) : (
        <>
          <Plus size={20} />
          My List
        </>
      )}
    </Button>
  );
}
