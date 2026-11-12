import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea data-slot="textarea"
      className={cn(
        'flex min-h-28 w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base shadow-xs transition-[color,border-color,box-shadow] outline-none md:text-sm',
        'placeholder:text-muted-foreground hover:border-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props} />
  );
}

export { Textarea };
