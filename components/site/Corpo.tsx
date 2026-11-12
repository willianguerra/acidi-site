// Corpo em blocos de uma notícia ou página: o mesmo HTML no site e na prévia do admin.
import { Fmt } from './Fmt';
import type { Bloco } from '@/lib/types';

export function Corpo({ blocos }: { blocos: Bloco[] }) {
  return blocos.map((b, i) => {
    if (typeof b === 'string') return <p key={i}><Fmt t={b} /></p>;
    if ('lista' in b) return <ul key={i}>{b.lista.map((x, k) => <li key={k}><Fmt t={x} /></li>)}</ul>;
    if ('citacao' in b) return <blockquote key={i}><Fmt t={b.citacao} /></blockquote>;
    if ('subtitulo' in b) return <h2 key={i}>{b.subtitulo}</h2>;
    if ('imagem' in b) return (
      <figure key={i} style={{ margin: '16px 0 0' }}>
        <div className="photo" style={{ borderRadius: 'var(--r)', aspectRatio: '3/2' }}><img src={b.imagem.src} alt={b.imagem.alt} loading="lazy" /></div>
        {b.imagem.legenda && <figcaption className="cap"><Fmt t={b.imagem.legenda} /></figcaption>}
      </figure>
    );
    return b.tabela.map((t, k) => [<h2 key={i + '-' + k}>{t.categoria}</h2>, <ul key={i + '-' + k + 'ul'}>{t.itens.map((x, m) => <li key={m}><Fmt t={x} /></li>)}</ul>]);
  });
}
