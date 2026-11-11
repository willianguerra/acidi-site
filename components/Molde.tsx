// Molde das páginas de texto: cabeçalho e seção "aside + prose" montados do conteúdo do banco.
import type { ReactNode } from 'react';
import { Fmt } from './Fmt';
import { Corpo } from './Corpo';
import type { ConteudoPagina } from '@/lib/types';

export function CabecalhoPagina({ cab, side }: { cab: ConteudoPagina['cabecalho']; side?: ReactNode }) {
  const t = <div className="t"><span className="kicker">{cab.etiqueta}</span><h1 className="hl">{cab.titulo} <b>{cab.destaque}</b></h1><p className="lead"><Fmt t={cab.chamada} /></p></div>;
  if (cab.foto) return (
    <header className="phead photo-head"><div className="wrap grid12">
      {t}
      <figure className="pic" style={{ margin: '0' }}><div className="photo"><img src={cab.foto.src} alt={cab.foto.alt} /></div>{cab.foto.legenda && <figcaption className="cap"><Fmt t={cab.foto.legenda} /></figcaption>}</figure>
    </div></header>
  );
  return (
    <header className="phead"><div className="wrap grid12">
      {t}
      {side && <div className="side">{side}</div>}
    </div></header>
  );
}

// inserir: elemento fixo da página, colocado no corpo logo depois do bloco de índice `apos`.
export function SecaoTexto({ c, aside, inserir }: { c: ConteudoPagina; aside?: ReactNode; inserir?: { apos: number; el: ReactNode } }) {
  const lat = c.lateral;
  if (!c.corpo.length && !lat && !aside) return null;
  const a = inserir ? c.corpo.slice(0, inserir.apos + 1) : c.corpo;
  return (
    <section className="sec"><div className="wrap split">
      <div className="aside">{aside ?? (lat && <>
        <p className="muted"><Fmt t={lat.texto} /></p>
        {lat.botao && <a className="btn btn-p" href={lat.botao.href}>{lat.botao.texto}</a>}
      </>)}</div>
      <div className="prose">
        <Corpo blocos={a} />
        {inserir && <>{inserir.el}<Corpo blocos={c.corpo.slice(inserir.apos + 1)} /></>}
      </div>
    </div></section>
  );
}
