import type { ReactNode } from 'react';
import type { Evento, Noticia } from '@/lib/types';
import { dlong, dshort, evId, MESES } from '@/lib/datas';

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
