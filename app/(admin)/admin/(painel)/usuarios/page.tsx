import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarUsuarios } from '@/lib/admin/usuarios';
import { FormNovoUsuario } from '@/components/admin/FormsUsuarios';

export const metadata = { title: 'Usuários' };

const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };

export default async function Page() {
  const r = await listarUsuarios(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  return (<>
    <h1>Usuários</h1>
    <details className="cartao"><summary><b>Criar conta</b></summary>
      <div style={{ marginTop: 16 }}><FormNovoUsuario /></div>
    </details>
    <div className="cartao">
      <ul className="lista">{r.valor.map(u => (
        <li key={u.id}>
          <span><a href={`/admin/usuarios/${u.id}`}>{u.nome}</a><br /><span className="meta">{u.email}</span></span>
          <span className="acoes"><span className="selo">{PAPEIS[u.papel]}</span>{!u.ativo && <span className="selo devolvida">Desativada</span>}{u.ativo && u.trocarSenha && <span className="selo revisao">Ainda não trocou a senha</span>}</span>
        </li>))}</ul>
    </div>
  </>);
}
