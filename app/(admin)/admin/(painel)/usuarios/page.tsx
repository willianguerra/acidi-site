import { Expansivel } from '@/components/admin/Expansivel';
import { Card } from '@/components/ui/card';
import { Selo } from '@/components/admin/Selo';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarUsuarios, type LinhaUsuario } from '@/lib/admin/usuarios';
import { lerPagina, paginar } from '@/lib/admin/lista';
import { FormNovoUsuario } from '@/components/admin/FormsUsuarios';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Tabela } from '@/components/admin/Tabela';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { MenuLinha } from '@/components/admin/MenuLinha';
import { Paginacao } from '@/components/admin/Paginacao';

export const metadata = { title: 'Usuários' };

const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };
const CAMINHO = '/admin/usuarios';

export default async function Page({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const r = await listarUsuarios(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const q = await searchParams;
  // shortcut: pagina em memória, são poucas contas; mover para o banco se passar de algumas centenas
  const p = paginar(r.valor, lerPagina(q.pagina));
  return (<>
    <Cabecalho titulo="Usuários" descricao="Contas de acesso ao painel e o papel de cada pessoa." />
    <Expansivel titulo="Criar conta">
      <FormNovoUsuario />
    </Expansivel>
    <CartaoLista titulo="Contas cadastradas" total={p.total}>
    <Tabela<LinhaUsuario> linhas={p.itens} chave={u => u.id} rotulo={u => u.nome} vazio={<p className="vazio">Nenhuma conta.</p>}
      colunas={[
        { titulo: 'Nome', classe: 'titulo', celula: u => <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">{u.nome.trim().charAt(0).toUpperCase()}</span>
          <div className="min-w-0"><a href={`/admin/usuarios/${u.id}`}>{u.nome}</a><span className="sub">{u.email}</span></div>
        </div> },
        { titulo: 'Perfil', celula: u => <Selo>{PAPEIS[u.papel]}</Selo> },
        { titulo: 'Situação', celula: u => !u.ativo ? <Selo s="devolvida">Desativada</Selo> : u.trocarSenha ? <Selo s="revisao">Ainda não trocou a senha</Selo> : <Selo s="publicada">Ativa</Selo> },
        { titulo: 'Ações', classe: 'col-acoes', celula: u => <MenuLinha nome={u.nome} links={[{ href: `/admin/usuarios/${u.id}`, rotulo: 'Editar', icone: 'edit' }]} /> },
      ]} />
    <Paginacao caminho={CAMINHO} params={{ pagina: q.pagina }} pagina={p.pagina} total={p.total} nome="contas" />
    </CartaoLista>
  </>);
}
