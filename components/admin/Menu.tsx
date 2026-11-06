'use client';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Ico, type IconName } from '@/components/Ico';
import type { Acao } from '@/lib/admin/permissoes';

export type ItemMenu = { href: string; rotulo: string; icone: IconName; acao?: Acao; contador?: number; secao?: string };

// Recebe só os itens que o servidor já filtrou com pode(); aqui só marca a página atual.
export function Menu({ itens }: { itens: ItemMenu[] }) {
  const atual = usePathname();
  const ativo = (h: string) => (h === '/admin' ? atual === h : atual === h || atual.startsWith(h + '/'));
  return (
    <nav aria-label="Admin">
      {itens.map(i => <Fragment key={i.href}>
        {i.secao && <span className="secao">{i.secao}</span>}
        <a href={i.href} aria-current={ativo(i.href) ? 'page' : undefined}>
          <Ico n={i.icone} />{i.rotulo}
          {!!i.contador && <span className="contagem" aria-label={`${i.contador} novas`}>{i.contador}</span>}
        </a>
      </Fragment>)}
    </nav>
  );
}
