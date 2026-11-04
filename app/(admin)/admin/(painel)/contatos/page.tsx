import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarContatos, FORMULARIOS } from '@/lib/admin/contatos';
import { quando } from '@/lib/datas';

export const metadata = { title: 'Mensagens' };


export default async function Page() {
  const r = await listarContatos(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  return (<>
    <h1>Mensagens do site</h1>
    <section className="cartao" aria-label="Mensagens recebidas">
      {r.valor.length
        ? <ul className="lista">{r.valor.map(c => <li key={c.id}><span><a href={`/admin/contatos/${c.id}`}>{c.nome}</a>{!c.lida && <> <span className="selo nova">Nova</span></>}<br /><span className="meta">{FORMULARIOS[c.formulario].titulo} · {c.email}</span></span><span className="meta">{quando(c.criadaEm)}</span></li>)}</ul>
        : <p className="vazio">Nenhuma mensagem recebida ainda.</p>}
    </section>
  </>);
}
