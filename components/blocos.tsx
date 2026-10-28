import type { ReactNode } from 'react';
import type { Evento, Noticia } from '@/lib/types';
import { dlong, dshort, evId, MESES } from '@/lib/datas';
import { Ico, Ext } from './Ico';
import { WHATS, MAPA } from '@/content/links';

export function Crumbs({ items }: { items: [href: string | null, texto: string][] }) {
  return (
    <nav className="crumbs wrap" aria-label="Você está em"><ol>
      {items.map(([h, t]) => h ? <li key={t}><a href={h}>{t}</a></li> : <li key={t} aria-current="page">{t}</li>)}
    </ol></nav>
  );
}

export function PageHead({ kicker, title, lead, side, pic }: {
  kicker: string; title: ReactNode; lead: ReactNode; side?: ReactNode;
  pic?: { src: string; alt: string; cap?: ReactNode };
}) {
  const t = <div className="t"><span className="kicker">{kicker}</span><h1 className="hl">{title}</h1><p className="lead">{lead}</p></div>;
  if (pic) return (
    <header className="phead photo-head"><div className="wrap grid12">
      {t}
      <figure className="pic" style={{ margin: '0' }}><div className="photo"><img src={'/assets/img/' + pic.src} alt={pic.alt} /></div>{pic.cap && <figcaption className="cap">{pic.cap}</figcaption>}</figure>
    </div></header>
  );
  return (
    <header className="phead"><div className="wrap grid12">
      {t}
      {side && <div className="side">{side}</div>}
    </div></header>
  );
}

// home: na página inicial os eventos passados já saem escondidos (o site.js recalcula no navegador)
export function EventItem({ e, home = false, hoje }: { e: Evento; home?: boolean; hoje?: string }) {
  const [y, m, d] = e.data.split('-');
  const info = ([['Data:', dlong(e.data)], ['Horário:', e.horario], ['Local:', e.local]] as const).filter(([, v]) => v);
  return (
    <li className="ev" id={evId(e)} data-date={e.data} hidden={home && !!hoje && e.data < hoje}>
      <div className="d" aria-hidden="true"><b>{+d}</b><span>{MESES[+m - 1]} {y}</span></div>
      <div><h3>{e.titulo}</h3><p className="muted">{e.descricao}</p><dl>{info.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
    </li>
  );
}

export function Story({ n, cls = 'story', showP = true }: { n: Noticia; cls?: string; showP?: boolean }) {
  return (
    <a className={cls} href={'/noticias/' + n.slug}>
      <div className="photo"><img src={'/assets/img/' + n.imagem} alt={n.alt} loading="lazy" /></div>
      <div><time dateTime={n.data}>{dshort(n.data)}</time><h3>{n.titulo}</h3>{showP && <p>{n.resumo}</p>}</div>
    </a>
  );
}

// Chamada de associação usada no fim de Histórico e Para seu negócio (a home tem uma versão própria)
export function JoinBox() {
  return (
<section className="join sec" aria-labelledby="h-join"><div className="wrap"><div className="box">
<div className="ask on-dark" data-anim="">
<svg className="liga" viewBox="0 0 700 460" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false"><path pathLength="1" d="M-40 70C200 20 450 80 560 220S610 400 646 420" /><circle cx="672" cy="436" r="32" /></svg>{' '}<span className="kicker">Associe-se</span>{' '}<h2 id="h-join" className="hl">Sua empresa <b>na rede da ACIDI</b></h2>
<p>A rede de relacionamento é o ponto de partida para o crescimento. Conheça os benefícios e fale com a equipe da associação.</p>
<div className="ctas"><a className="btn btn-y" href="/associe-se" data-cta="">Conhecer os benefícios <Ico n="go" cls="ico go" /></a><Ext href={WHATS} cls="btn btn-w">Falar pelo WhatsApp</Ext></div>
</div>
<div className="contact on-dark">
<h3>Contato</h3>
<dl>
<div><dt>Telefone e WhatsApp</dt><dd>(47) 3333-8786</dd></div>
<div><dt>E-mail</dt><dd>contato@acidi.net</dd></div>
<div><dt>Endereço</dt><dd>Rua Ver. Alvin Rauh Júnior, 100<br />Nações, Indaial/SC · CEP 89082-065</dd></div>
</dl>
<p><Ext href={MAPA} cls="tlink">Abrir no mapa</Ext></p>
</div>
</div></div></section>
  );
}
