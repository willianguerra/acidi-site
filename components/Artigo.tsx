// Página de uma notícia, usada pelo site público e pela prévia do admin (mesmo HTML).
import { Header } from './Header';
import { Footer } from './Footer';
import { Crumbs } from './blocos';
import { Ico } from './Ico';
import { dlong } from '@/lib/datas';
import { Corpo } from './Corpo';
import type { Noticia } from '@/lib/types';

type Vizinha = Pick<Noticia, 'slug' | 'titulo'>;

export function Artigo({ n, prox, ant }: { n: Noticia; prox?: Vizinha; ant?: Vizinha }) {
  return (<>
    <Header page="noticia" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], ['/noticias', 'Notícias'], [null, n.titulo]]} />
      <article>
        <header className="article-head wrap"><time className="date" dateTime={n.data}>Publicado em {dlong(n.data)}</time><h1>{n.titulo}</h1><p className="lead">{n.resumo}</p></header>
        <figure className="article-fig wrap"><div className="photo"><img src={n.imagem} alt={n.alt} /></div></figure>
        <div className="wrap article-body">
          <div className="prose"><Corpo blocos={n.corpo} /></div>
          <aside className="meta"><div><b style={{ color: 'var(--tinta)' }}>Publicação original</b><br />{dlong(n.data)}</div><div><a className="btn btn-s" href="/noticias"><Ico n="back" /> Voltar às notícias</a></div></aside>
        </div>
        <div className="wrap"><nav className="article-foot" aria-label="Outras notícias">
          {prox ? <a className="tlink" href={'/noticias/' + prox.slug}>← Mais recente: {prox.titulo}</a> : <span></span>}
          {ant && <a className="tlink" href={'/noticias/' + ant.slug}>Anterior: {ant.titulo} →</a>}
        </nav></div>
      </article>
    </main>
    <Footer />
  </>);
}
