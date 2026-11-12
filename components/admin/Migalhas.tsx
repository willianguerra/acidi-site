'use client';
import { usePathname } from 'next/navigation';

const SECOES: Record<string, string> = { noticias: 'Notícias', agenda: 'Agenda', paginas: 'Páginas', diretoria: 'Diretoria', 'ex-presidentes': 'Ex-presidentes', contatos: 'Mensagens', usuarios: 'Usuários', conta: 'Minha conta' };
const FOLHAS: Record<string, string> = { 'noticias/nova': 'Nova notícia', 'paginas/nova': 'Nova página', 'paginas/home': 'Página inicial', 'agenda/novo': 'Novo evento' };
const ITEM: Record<string, string> = { contatos: 'Mensagem', usuarios: 'Conta' };

// Caminho no topo, montado a partir do endereço. A classe "migalhas" é usada pelos testes em testes/admin.py.
export function Migalhas() {
  const [secao, folha] = usePathname().split('/').slice(2);
  const itens: { href?: string; rotulo: string }[] = !secao ? [{ rotulo: 'Painel' }, { rotulo: 'Visão geral' }]
    : [{ href: '/admin', rotulo: 'Painel' }, { href: folha ? '/admin/' + secao : undefined, rotulo: SECOES[secao] ?? secao },
      ...(folha ? [{ rotulo: FOLHAS[secao + '/' + folha] ?? ITEM[secao] ?? 'Editar' }] : [])];
  return (<nav aria-label="Você está em" className="migalhas min-w-0"><ol className="flex items-center gap-2 text-sm text-muted-foreground">{itens.map((m, i) => {
    const ultimo = i === itens.length - 1;
    return (<li key={i} className={'flex min-w-0 items-center gap-2 ' + (ultimo ? '' : 'max-sm:hidden')}>
      {i > 0 && <span aria-hidden="true" className="text-input max-sm:hidden">/</span>}
      {m.href ? <a className="rounded-sm hover:text-primary" href={m.href}>{m.rotulo}</a>
        : <span aria-current={ultimo ? 'page' : undefined} className={ultimo ? 'truncate font-semibold text-accent-foreground' : undefined}>{m.rotulo}</span>}
    </li>);
  })}</ol></nav>);
}
