import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarUsuarios, type LinhaUsuario } from '@/lib/admin/usuarios';
import { lerPagina, paginar } from '@/lib/admin/lista';
import { FormNovoUsuario } from '@/components/admin/FormsUsuarios';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Tabela } from '@/components/admin/Tabela';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { AcoesLinha } from '@/components/admin/AcoesLinha';
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
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Usuários' }]} titulo="Usuários" descricao="Contas de acesso ao painel e o papel de cada pessoa." />
    <details className="cartao"><summary><b>Criar conta</b></summary>
      <div style={{ marginTop: 16 }}><FormNovoUsuario /></div>
    </details>
    <CartaoLista titulo="Contas cadastradas" total={p.total}>
    <Tabela<LinhaUsuario> linhas={p.itens} chave={u => u.id} rotulo={u => u.nome} vazio={<p className="vazio">Nenhuma conta.</p>}
      colunas={[
        { titulo: 'Nome', classe: 'titulo', celula: u => <><a href={`/admin/usuarios/${u.id}`}>{u.nome}</a><span className="sub">{u.email}</span></> },
        { titulo: 'Papel', celula: u => <span className="selo">{PAPEIS[u.papel]}</span> },
        { titulo: 'Situação', celula: u => !u.ativo ? <span className="selo devolvida">Desativada</span> : u.trocarSenha ? <span className="selo revisao">Ainda não trocou a senha</span> : <span className="selo publicada">Ativa</span> },
        { titulo: 'Ações', classe: 'col-acoes', celula: u => <AcoesLinha links={[{ href: `/admin/usuarios/${u.id}`, rotulo: 'Editar', icone: 'edit' }]} /> },
      ]} />
    <Paginacao caminho={CAMINHO} params={{ pagina: q.pagina }} pagina={p.pagina} total={p.total} />
    </CartaoLista>
  </>);
}
