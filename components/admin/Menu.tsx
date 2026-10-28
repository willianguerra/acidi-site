'use client';
import { usePathname } from 'next/navigation';
import type { Acao } from '@/lib/admin/permissoes';

export type ItemMenu = { href: string; rotulo: string; acao?: Acao };

// Recebe só os itens que o servidor já filtrou com pode(); aqui só marca a página atual.
export function Menu({ itens }: { itens: ItemMenu[] }) {
  const atual = usePathname();
  const ativo = (h: string) => (h === '/admin' ? atual === h : atual === h || atual.startsWith(h + '/'));
  return (
    <nav aria-label="Admin">
      {itens.map(i => <a key={i.href} href={i.href} aria-current={ativo(i.href) ? 'page' : undefined}>{i.rotulo}</a>)}
    </nav>
  );
}
