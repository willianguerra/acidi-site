import { exigirUsuario } from '@/lib/auth-servidor';
import { pode } from '@/lib/admin/permissoes';
import { Menu, type ItemMenu } from '@/components/admin/Menu';
import { sair } from '../acoes';

const ITENS: ItemMenu[] = [
  { href: '/admin', rotulo: 'Início' },
  { href: '/admin/noticias', rotulo: 'Notícias', acao: 'noticia.criar' },
  { href: '/admin/agenda', rotulo: 'Agenda', acao: 'agenda.editar' },
  { href: '/admin/diretoria', rotulo: 'Diretoria', acao: 'diretoria.editar' },
  { href: '/admin/ex-presidentes', rotulo: 'Ex-presidentes', acao: 'diretoria.editar' },
  { href: '/admin/usuarios', rotulo: 'Usuários', acao: 'usuarios.gerir' },
  { href: '/admin/conta', rotulo: 'Minha conta' },
];

const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  return (<>
    <header className="barra"><div className="in">
      <a href="/admin"><img src="/assets/img/logo.png" width="113" height="30" alt="ACIDI admin, início" /></a>
      <Menu itens={ITENS.filter(i => !i.acao || pode(u, i.acao))} />
      <div className="quem"><span>{u.nome} · {PAPEIS[u.papel]}</span><a href="/" style={{ color: '#fff' }}>Ver site</a>
        <form action={sair}><button type="submit">Sair</button></form></div>
    </div></header>
    <main className="conteudo" id="conteudo">{children}</main>
  </>);
}
