import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('flex w-full items-start gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium [&_a]:text-current [&_a]:underline [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0', {
  variants: {
    variant: {
      ok: 'border-primary/20 bg-ok-soft text-accent-foreground',
      info: 'border-aviso-ink/20 bg-aviso-soft text-aviso-ink',
      destructive: 'border-destructive/25 bg-erro-soft text-destructive',
    },
  },
  defaultVariants: { variant: 'ok' },
});

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export { Alert, alertVariants };
