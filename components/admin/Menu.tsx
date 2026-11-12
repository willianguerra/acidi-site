'use client';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Ico, type IconName } from '@/components/Ico';
import type { Acao } from '@/lib/admin/permissoes';

export type ItemMenu = { href: string; rotulo: string; icone: IconName; acao?: Acao; contador?: number; secao?: string };

// o traço amarelo à esquerda marca a página atual
const ITEM = 'relative flex items-center gap-2.5 rounded-md py-1.75 pr-2.5 pl-3.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/[.07] hover:text-white '
  + 'aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-semibold aria-[current=page]:text-white '
  + 'aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2 aria-[current=page]:before:left-1 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-full aria-[current=page]:before:bg-amarelo';

// Recebe só os itens que o servidor já filtrou com pode(); aqui só marca a página atual.
export function Menu({ itens }: { itens: ItemMenu[] }) {
  const atual = usePathname();
  const ativo = (h: string) => (h === '/admin' ? atual === h : atual === h || atual.startsWith(h + '/'));
  return (
    <nav aria-label="Admin" className="grid content-start gap-0.5">
      {itens.map(i => <Fragment key={i.href}>
        {i.secao && <span className="mx-3.5 mt-4 mb-1 text-[0.66rem] font-bold tracking-[0.14em] text-sidebar-muted uppercase">{i.secao}</span>}
        <a href={i.href} className={ITEM} aria-current={ativo(i.href) ? 'page' : undefined}>
          <Ico n={i.icone} />{i.rotulo}
          {!!i.contador && <span className="ml-auto min-w-5 rounded-full bg-amarelo px-1.5 text-center text-[0.7rem] leading-5 font-bold text-mata" aria-label={`${i.contador} novas`}>{i.contador}</span>}
        </a>
      </Fragment>)}
    </nav>
  );
}
