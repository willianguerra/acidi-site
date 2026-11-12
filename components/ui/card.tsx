import * as React from 'react';
import { cn } from '@/lib/utils';

// exportada para dar a aparência de cartão a <form> e <fieldset>, que não podem virar <div>
const cardClass = 'flex min-w-0 flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-card';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn(cardClass, className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex flex-wrap items-center justify-between gap-3', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('font-display text-[1.0625rem] leading-tight font-bold', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, cardClass };
