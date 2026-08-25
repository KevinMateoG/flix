import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'focus-visible:ring-primary inline-flex cursor-pointer items-center justify-center rounded font-semibold whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-on-primary hover:bg-primary/90': variant === 'primary',
            'border-on-background/20 hover:bg-on-background/10 border bg-transparent':
              variant === 'secondary',
            'text-body-sm h-10 px-4 py-2': size === 'default',
            'text-label-caps h-8 rounded-sm px-3': size === 'sm',
            'text-body-lg h-12 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className,
        )}
        {...props}
        disabled={props.disabled ? true : undefined}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
