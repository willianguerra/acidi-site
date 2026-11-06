import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarMembros, GRUPOS } from '@/lib/admin/diretoria';
import { FormMembro } from '@/components/admin/FormsDiretoria';
import { Mover } from '@/components/admin/Mover';
import { moverMembro } from './acoes';

import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Diretoria' };

const OKS: Record<string, string> = { salvo: 'Diretoria atualizada no site.', apagado: 'Membro removido.' };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const r = await listarMembros(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Diretoria' }]} titulo="Diretoria" extra={<a className="bt sec" href="/diretoria" target="_blank" rel="noopener">Ver no site<span className="sr"> (abre em nova aba)</span></a>} />
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
    <details className="cartao"><summary><b>Adicionar membro</b></summary>
      <div style={{ marginTop: 16 }}><FormMembro m={{ id: null, grupo: 'executiva', rotulo: '', nome: '', suplente: false }} grupos={GRUPOS} /></div>
    </details>
    {Object.entries(GRUPOS).map(([g, titulo]) => {
      const ms = r.valor.filter(m => m.grupo === g);
      return (
        <section className="cartao" key={g} aria-labelledby={'g-' + g}>
          <h2 id={'g-' + g}>{titulo}</h2>
          {ms.length ? <ul className="lista">{ms.map((m, i) => (
            <li key={m.id} id={'m-' + m.id}>
              <span><a href={`/admin/diretoria/${m.id}`}>{m.nome}</a>{(m.rotulo || m.suplente) && <><br /><span className="meta">{m.rotulo}{m.suplente && 'Suplente'}</span></>}</span>
              <Mover id={m.id} nome={m.nome} acao={moverMembro} primeiro={i === 0} ultimo={i === ms.length - 1} />
            </li>))}</ul>
            : <p className="vazio">Ninguém neste grupo.</p>}
        </section>
      );
    })}
  </>);
}
