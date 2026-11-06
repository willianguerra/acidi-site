import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { pode } from '@/lib/admin/permissoes';
import { naoLidas } from '@/lib/admin/contatos';
import { Menu, type ItemMenu } from '@/components/admin/Menu';
import { Gaveta } from '@/components/admin/Gaveta';
import { Ico } from '@/components/Ico';
import { sair } from '../acoes';

const ITENS: ItemMenu[] = [
  { href: '/admin', rotulo: 'Início', icone: 'home' },
  { href: '/admin/noticias', rotulo: 'Notícias', icone: 'news', acao: 'noticia.criar' },
  { href: '/admin/agenda', rotulo: 'Agenda', icone: 'cal', acao: 'agenda.editar' },
  { href: '/admin/diretoria', rotulo: 'Diretoria', icone: 'people', acao: 'diretoria.editar' },
  { href: '/admin/ex-presidentes', rotulo: 'Ex-presidentes', icone: 'star', acao: 'diretoria.editar' },
  { href: '/admin/contatos', rotulo: 'Mensagens', icone: 'mail', acao: 'contatos.ver' },
  { href: '/admin/usuarios', rotulo: 'Usuários', icone: 'users', acao: 'usuarios.gerir' },
  { href: '/admin/conta', rotulo: 'Minha conta', icone: 'user' },
];

const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  // O contador é enfeite: se o banco falhar aqui, o painel abre sem ele.
  const novas = await naoLidas(db, u).catch(() => 0);
  const itens = ITENS.filter(i => !i.acao || pode(u, i.acao)).map(i => (i.href === '/admin/contatos' ? { ...i, contador: novas } : i));
  return (<div className="painel">
    <a className="pular" href="#conteudo">Pular para o conteúdo</a>
    <Gaveta>
      <a className="marca" href="/admin"><img src="/assets/img/logo.png" width="113" height="30" alt="ACIDI admin, início" /><span>Painel</span></a>
      <Menu itens={itens} />
      <div className="quem">
        <span className="avatar" aria-hidden="true">{u.nome.trim().charAt(0).toUpperCase()}</span>
        <span className="nome"><b>{u.nome}</b>{PAPEIS[u.papel]}</span>
        <a href="/"><Ico n="ext" />Ver site</a>
        <form action={sair}><button type="submit"><Ico n="logout" />Sair</button></form>
      </div>
    </Gaveta>
    <main className="conteudo" id="conteudo">{children}</main>
  </div>);
}
