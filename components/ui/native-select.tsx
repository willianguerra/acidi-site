import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// <select> nativo: os filtros e formulários do admin enviam por GET/Server Action e funcionam sem JS.
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div data-slot="native-select-wrapper" className="relative w-full min-w-0">
      <select data-slot="native-select"
        className={cn(
          'h-9 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-card py-1.5 pr-9 pl-3 text-base shadow-xs transition-[color,border-color,box-shadow] outline-none md:text-sm',
          'hover:border-ring/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props} />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { NativeSelect };
