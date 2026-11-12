import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input type={type} data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1.5 text-base shadow-xs transition-[color,border-color,box-shadow] outline-none md:text-sm',
        'placeholder:text-muted-foreground hover:border-ring/50 read-only:bg-muted read-only:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
        'file:mr-3 file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent file:px-2.5 file:text-sm file:font-semibold file:text-accent-foreground',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props} />
  );
}

export { Input };
