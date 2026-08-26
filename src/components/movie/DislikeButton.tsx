'use client';

import * as React from 'react';
import { ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toggleDislike, checkIfDisliked } from '@/app/actions/dislikes';

interface DislikeButtonProps {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DislikeButton({
  profileId,
  tmdbId,
  mediaType,
  variant = 'secondary',
  size = 'icon',
}: DislikeButtonProps) {
  const [isDisliked, setIsDisliked] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let active = true;
    async function check() {
      try {
        const result = await checkIfDisliked({ profileId, tmdbId, mediaType });
        if (active) {
          setIsDisliked(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking dislike:', err);
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
      const res = await toggleDislike({ profileId, tmdbId, mediaType });
      setIsDisliked(res.added);
    } catch (err) {
      console.error('Error toggling dislike:', err);
    } finally {
      setToggling(false);
    }
  };

  if (!mounted || loading) {
    return (
      <Button variant={variant} size={size} disabled={true} title="Dislike">
        <Loader2 size={20} className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggling}
      title="Dislike"
      className={isDisliked ? 'text-primary' : ''}
    >
      <ThumbsDown size={20} className={isDisliked ? 'fill-primary' : ''} />
    </Button>
  );
}
