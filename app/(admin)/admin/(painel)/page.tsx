import { exigirUsuario } from '@/lib/auth-servidor';
import { getEventos } from '@/lib/content';
import { dshort, hojeIso, separarEventos } from '@/lib/datas';

export const metadata = { title: 'Início' };

export default async function Page() {
  const u = await exigirUsuario();
  const { prox } = separarEventos(await getEventos(), hojeIso());
  return (<>
    <h1>Olá, {u.nome.split(' ')[0]}</h1>
    <section className="cartao" aria-labelledby="h-ev">
      <div className="cabeca"><h2 id="h-ev">Próximos eventos</h2><a className="bt sec peq" href="/admin/agenda">Abrir agenda</a></div>
      {prox.length ? <ul className="lista">{prox.slice(0, 5).map(e => <li key={e.data + e.titulo}><span>{e.titulo}</span><span className="meta">{dshort(e.data)}{e.horario && ' · ' + e.horario}</span></li>)}</ul>
        : <p className="vazio">Nenhum evento futuro na agenda.</p>}
    </section>
  </>);
}
