import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarEventos, type LinhaEvento } from '@/lib/admin/eventos';
import { dshort, hojeIso } from '@/lib/datas';

export const metadata = { title: 'Agenda' };

const OKS: Record<string, string> = { salvo: 'Evento salvo: a agenda do site já foi atualizada.', apagado: 'Evento apagado.' };

function Lista({ eventos, vazio }: { eventos: LinhaEvento[]; vazio: string }) {
  return eventos.length
    ? <ul className="lista">{eventos.map(e => <li key={e.id}><span><a href={`/admin/agenda/${e.id}`}>{e.titulo}</a><br /><span className="meta">{e.local}</span></span><span className="meta">{dshort(e.data)}{e.horario && ' · ' + e.horario}</span></li>)}</ul>
    : <p className="vazio">{vazio}</p>;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await exigirUsuario();
  const r = await listarEventos(db, u);
  if (!r.ok) redirect('/admin');
  const hoje = hojeIso(), ok = (await searchParams).ok;
  return (<>
    <div className="cabeca"><h1>Agenda</h1><a className="bt" href="/admin/agenda/novo">Novo evento</a></div>
    {ok && OKS[ok] && <p className="aviso ok" role="status">{OKS[ok]}</p>}
    <section className="cartao" aria-labelledby="h-prox"><h2 id="h-prox">Próximos</h2><Lista eventos={r.valor.filter(e => e.data >= hoje)} vazio="Nenhum evento futuro." /></section>
    <section className="cartao" aria-labelledby="h-pass"><h2 id="h-pass">Passados</h2><Lista eventos={r.valor.filter(e => e.data < hoje).reverse()} vazio="Nenhum evento passado." /></section>
  </>);
}
