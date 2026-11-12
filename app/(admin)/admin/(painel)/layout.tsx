import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { pode } from '@/lib/admin/permissoes';
import { naoLidas } from '@/lib/admin/contatos';
import { Menu, type ItemMenu } from '@/components/admin/Menu';
import { Gaveta } from '@/components/admin/Gaveta';
import { Migalhas } from '@/components/admin/Migalhas';
import { Button } from '@/components/ui/button';
import { Ico } from '@/components/Ico';
import { sair } from '../acoes';

const ITENS: ItemMenu[] = [
  { href: '/admin', rotulo: 'Início', icone: 'home' },
  { secao: 'Conteúdo', href: '/admin/noticias', rotulo: 'Notícias', icone: 'news', acao: 'noticia.criar' },
  { href: '/admin/agenda', rotulo: 'Agenda', icone: 'cal', acao: 'agenda.editar' },
  { href: '/admin/paginas', rotulo: 'Páginas', icone: 'doc', acao: 'paginas.editar' },
  { secao: 'Institucional', href: '/admin/diretoria', rotulo: 'Diretoria', icone: 'people', acao: 'diretoria.editar' },
  { href: '/admin/ex-presidentes', rotulo: 'Ex-presidentes', icone: 'star', acao: 'diretoria.editar' },
  { secao: 'Atendimento', href: '/admin/contatos', rotulo: 'Mensagens', icone: 'mail', acao: 'contatos.ver' },
  { secao: 'Administração', href: '/admin/usuarios', rotulo: 'Usuários', icone: 'users', acao: 'usuarios.gerir' },
];

const ITEM_CONTA = 'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary';
const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  // O contador é enfeite: se o banco falhar aqui, o painel abre sem ele.
  const novas = await naoLidas(db, u).catch(() => 0);
  const itens = ITENS.filter(i => !i.acao || pode(u, i.acao)).map(i => (i.href === '/admin/contatos' ? { ...i, contador: novas } : i));
  return (<div className="min-h-svh lg:grid lg:grid-cols-[var(--lado)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
    <a className="absolute top-2 -left-[9999px] z-50 rounded-lg bg-amarelo px-3.5 py-2 font-bold text-mata focus:left-2" href="#conteudo">Pular para o conteúdo</a>
    <Gaveta topo={<>
      <Migalhas />
      <Button asChild variant="outline" size="sm" className="ml-auto max-sm:hidden"><a href="/" target="_blank" rel="noopener"><Ico n="ext" cls="ico size-4" />Ver site<span className="sr-only"> (abre em nova aba)</span></a></Button>
      <span className="h-5 w-px bg-border max-sm:hidden" aria-hidden="true" />
      {/* A conta fica só aqui, no canto do topo. <details> nativo: abre sem JS; a Gaveta fecha ao clicar fora. */}
      <details className="usuario relative max-sm:ml-auto">
        <summary aria-label={`Conta de ${u.nome}`} title="Sua conta" className="grid size-9 list-none place-items-center rounded-full bg-accent text-accent-foreground hover:bg-ok-soft [&::-webkit-details-marker]:hidden">
          <Ico n="user" /></summary>
        <div className="menu absolute top-[calc(100%+8px)] right-0 z-50 grid w-60 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
          <p className="mb-1 border-b px-2.5 pt-1.5 pb-2.5 leading-snug"><b className="block truncate font-semibold">{u.nome}</b><span className="block truncate text-xs text-muted-foreground">{u.email}</span><span className="text-xs text-muted-foreground">{PAPEIS[u.papel]}</span></p>
          <a className={ITEM_CONTA} href="/admin/conta"><Ico n="user" />Minha conta</a>
          <a className={ITEM_CONTA + ' sm:hidden'} href="/" target="_blank" rel="noopener"><Ico n="ext" />Ver site<span className="sr-only"> (abre em nova aba)</span></a>
          <form action={sair} className="mt-1 border-t pt-1"><button type="submit" className={ITEM_CONTA}><Ico n="logout" />Sair</button></form>
        </div>
      </details>
    </>}>
      <a className="grid gap-1.5 px-3" href="/admin"><img src="/assets/img/logo-branca.png" width="121" height="32" alt="ACIDI, início do painel" className="h-9 w-auto justify-self-start" />
        <span className="text-[0.62rem] font-bold tracking-[0.16em] text-sidebar-muted uppercase">Painel administrativo</span></a>
      <Menu itens={itens} />
    </Gaveta>
    <main className="min-w-0 px-4 pt-5 pb-20 lg:col-start-2 lg:row-start-2 lg:px-8 lg:pt-6" id="conteudo">{children}</main>
  </div>);
}
