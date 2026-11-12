'use client';
import * as React from 'react';
import { DropdownMenu as M } from 'radix-ui';
import { cn } from '@/lib/utils';

// Menu suspenso (Radix): abre em portal, por isso não é cortado por tabelas e cartões com overflow.
const DropdownMenu = M.Root;
const DropdownMenuTrigger = M.Trigger;

function DropdownMenuContent({ className, sideOffset = 6, align = 'end', ...props }: React.ComponentProps<typeof M.Content>) {
  return (<M.Portal>
    <M.Content data-slot="dropdown-menu-content" sideOffset={sideOffset} align={align} collisionPadding={8}
      className={cn('z-50 min-w-44 rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-lg outline-none', className)} {...props} />
  </M.Portal>);
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof M.Item>) {
  return <M.Item data-slot="dropdown-menu-item"
    className={cn("flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 font-medium no-underline outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-secondary [&_svg]:size-4 [&_svg]:shrink-0", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
