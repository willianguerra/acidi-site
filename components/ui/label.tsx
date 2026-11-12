import * as React from 'react';
import { cn } from '@/lib/utils';

// <label> nativo (sem Radix): os formulários do admin funcionam sem JS.
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return <label data-slot="label" className={cn('text-sm leading-snug font-semibold', className)} {...props} />;
}

export { Label };
