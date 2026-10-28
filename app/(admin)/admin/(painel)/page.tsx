import { exigirUsuario } from '@/lib/auth-servidor';
import { getEventos } from '@/lib/content';
import { dshort, hojeIso, separarEventos } from '@/lib/datas';
import { db } from '@/lib/db';
import { listarNoticias, type ItemLista } from '@/lib/admin/noticias';
import { pode } from '@/lib/admin/permissoes';

export const metadata = { title: 'Início' };

export default async function Page() {
  const u = await exigirUsuario();
  const { prox } = separarEventos(await getEventos(), hojeIso());
  const revisa = pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' });
  const lista = async (situacao: 'revisao' | 'devolvida') => { const r = await listarNoticias(db, u, { situacao }); return r.ok ? r.valor : []; };
  const emRevisao = revisa ? await lista('revisao') : [];
  const devolvidas = pode(u, 'noticia.criar') ? (await lista('devolvida')).filter(n => n.autorId === u.id) : [];
  const itens = (ns: ItemLista[], comentario = false) => <ul className="lista">{ns.map(n => <li key={n.id}><span><a href={`/admin/noticias/${n.id}`}>{n.titulo}</a>{comentario && n.comentarioRevisao && <><br /><span className="meta">{n.comentarioRevisao}</span></>}</span><span className="meta">{n.autor}</span></li>)}</ul>;
  return (<>
    <h1>Olá, {u.nome.split(' ')[0]}</h1>
    {revisa && <section className="cartao" aria-labelledby="h-rev">
      <h2 id="h-rev">Aguardando revisão</h2>
      {emRevisao.length ? itens(emRevisao) : <p className="vazio">Nenhuma notícia esperando revisão.</p>}
    </section>}
    {devolvidas.length > 0 && <section className="cartao" aria-labelledby="h-dev">
      <h2 id="h-dev">Devolvidas para você ajustar</h2>
      {itens(devolvidas, true)}
    </section>}
    <section className="cartao" aria-labelledby="h-ev">
      <div className="cabeca"><h2 id="h-ev">Próximos eventos</h2><a className="bt sec peq" href="/admin/agenda">Abrir agenda</a></div>
      {prox.length ? <ul className="lista">{prox.slice(0, 5).map(e => <li key={e.data + e.titulo}><span>{e.titulo}</span><span className="meta">{dshort(e.data)}{e.horario && ' · ' + e.horario}</span></li>)}</ul>
        : <p className="vazio">Nenhum evento futuro na agenda.</p>}
    </section>
  </>);
}
