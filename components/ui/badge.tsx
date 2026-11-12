import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-bold whitespace-nowrap', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-background text-muted-foreground',
      ok: 'bg-ok-soft text-accent-foreground',
      aviso: 'bg-aviso-soft text-aviso-ink',
      destructive: 'bg-erro-soft text-destructive',
      marca: 'bg-amarelo text-mata',
    },
  },
  defaultVariants: { variant: 'secondary' },
});

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
