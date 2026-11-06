import { exigirUsuario } from '@/lib/auth-servidor';
import { getEventos } from '@/lib/content';
import { dshort, hojeIso, quando, separarEventos } from '@/lib/datas';
import { db } from '@/lib/db';
import { listarNoticias, type ItemLista } from '@/lib/admin/noticias';
import { listarContatos, FORMULARIOS } from '@/lib/admin/contatos';
import { resumoPainel } from '@/lib/admin/painel';
import { pode } from '@/lib/admin/permissoes';
import { Ico } from '@/components/Ico';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Início' };

export default async function Page() {
  const u = await exigirUsuario();
  const revisa = pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' });
  const escreve = pode(u, 'noticia.criar');
  const lista = async (situacao: 'revisao' | 'devolvida') => { const r = await listarNoticias(db, u, { situacao }); return r.ok ? r.valor.itens : []; };
  let dados;
  try {
    const [resumo, eventos, emRevisao, devolvidas, msgs] = await Promise.all([
      resumoPainel(db, u), getEventos(), revisa ? lista('revisao') : [],
      escreve ? lista('devolvida').then(ns => ns.filter(n => n.autorId === u.id)) : [],
      listarContatos(db, u, {}),
    ]);
    dados = { resumo, prox: separarEventos(eventos, hojeIso()).prox, emRevisao, devolvidas, msgs: msgs.ok ? msgs.valor.itens.slice(0, 5) : null };
  } catch {
    return (<><h1>Olá, {u.nome.split(' ')[0]}</h1><Aviso tipo="erro">Não foi possível carregar o painel. <a href="/admin">Tentar de novo</a></Aviso></>);
  }
  const { resumo, prox, emRevisao, devolvidas, msgs } = dados;
  const itens = (ns: ItemLista[], comentario = false) => <ul className="lista">{ns.map(n => <li key={n.id}><span><a href={`/admin/noticias/${n.id}`}>{n.titulo}</a>{comentario && n.comentarioRevisao && <><br /><span className="meta">{n.comentarioRevisao}</span></>}</span><span className="meta">{n.autor}</span></li>)}</ul>;
  const contador = (href: string, rotulo: string, n: number | undefined, destaque = false) =>
    n !== undefined && <a className={destaque && n > 0 ? 'contador destaque' : 'contador'} href={href}>{rotulo}<b>{n}</b></a>;

  return (<>
    <header className="cabecalho">
      <h1>Olá, {u.nome.split(' ')[0]}</h1>
      <div className="atalhos">
        {pode(u, 'agenda.editar') && <a className="bt sec" href="/admin/agenda/novo"><Ico n="cal" />Novo evento</a>}
        {escreve && <a className="bt" href="/admin/noticias/nova"><Ico n="plus" />Nova notícia</a>}
      </div>
    </header>
    <div className="contadores">
      {contador('/admin/noticias?situacao=publicada', 'Notícias publicadas', resumo.publicadas)}
      {contador('/admin/noticias?situacao=revisao', 'Aguardando revisão', resumo.emRevisao, true)}
      {pode(u, 'agenda.editar') && contador('/admin/agenda', 'Eventos futuros', resumo.eventosFuturos)}
      {contador('/admin/contatos?lida=nao', 'Mensagens novas', resumo.mensagensNovas, true)}
    </div>
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
    {msgs && <section className="cartao" aria-labelledby="h-msg">
      <div className="cabeca"><h2 id="h-msg">Mensagens recentes</h2><a className="bt sec peq" href="/admin/contatos">Abrir mensagens</a></div>
      {msgs.length ? <ul className="lista">{msgs.map(c => <li key={c.id}><span><a href={`/admin/contatos/${c.id}`}>{c.nome}</a>{!c.lida && <> <span className="selo nova">Nova</span></>}<br /><span className="meta">{FORMULARIOS[c.formulario].titulo}</span></span><span className="meta">{quando(c.criadaEm)}</span></li>)}</ul>
        : <p className="vazio">Nenhuma mensagem recebida ainda.</p>}
    </section>}
  </>);
}
