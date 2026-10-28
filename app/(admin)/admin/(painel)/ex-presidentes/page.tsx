import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarExPresidentes } from '@/lib/admin/ex-presidentes';
import { FormExPresidente } from '@/components/admin/FormsDiretoria';
import { Mover } from '@/components/admin/Mover';
import { moverExPresidente } from '../diretoria/acoes';

export const metadata = { title: 'Ex-presidentes' };

const OKS: Record<string, string> = { salvo: 'Lista atualizada no site.', apagado: 'Removido da lista.' };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const r = await listarExPresidentes(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok;
  return (<>
    <h1>Ex-presidentes</h1>
    {ok && OKS[ok] && <p className="aviso ok" role="status">{OKS[ok]}</p>}
    <details className="cartao"><summary><b>Adicionar ex-presidente</b></summary>
      <div style={{ marginTop: 16 }}><FormExPresidente p={{ id: null, nome: '', gestao: '', foto: '' }} /></div>
    </details>
    <div className="cartao">
      <ul className="lista">{r.valor.map((p, i) => (
        <li key={p.id} id={'p-' + p.id}>
          <span><a href={`/admin/ex-presidentes/${p.id}`}>{p.nome}</a>{p.gestao && <><br /><span className="meta">{p.gestao}</span></>}</span>
          <Mover id={p.id} nome={p.nome} acao={moverExPresidente} primeiro={i === 0} ultimo={i === r.valor.length - 1} />
        </li>))}</ul>
    </div>
  </>);
}
