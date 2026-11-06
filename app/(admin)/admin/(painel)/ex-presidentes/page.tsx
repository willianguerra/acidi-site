import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarExPresidentes } from '@/lib/admin/ex-presidentes';
import { FormExPresidente } from '@/components/admin/FormsDiretoria';
import { Mover } from '@/components/admin/Mover';
import { moverExPresidente } from '../diretoria/acoes';

import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Ex-presidentes' };

const OKS: Record<string, string> = { salvo: 'Lista atualizada no site.', apagado: 'Removido da lista.' };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const r = await listarExPresidentes(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Ex-presidentes' }]} titulo="Ex-presidentes" extra={<a className="bt sec" href="/ex-presidentes" target="_blank" rel="noopener">Ver no site<span className="sr"> (abre em nova aba)</span></a>} />
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
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
