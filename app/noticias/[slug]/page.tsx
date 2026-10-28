import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs } from '@/components/blocos';
import { Ico } from '@/components/Ico';
import { getNoticias, getNoticia } from '@/lib/content';
import { dlong } from '@/lib/datas';
import type { Bloco } from '@/lib/types';
import { SUF } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getNoticias()).map(n => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props) {
  const n = await getNoticia((await params).slug);
  return n ? { title: n.titulo + SUF, description: n.resumo } : {};
}

function Corpo({ blocos }: { blocos: Bloco[] }) {
  return blocos.map((b, i) => {
    if (typeof b === 'string') return <p key={i}>{b}</p>;
    if ('lista' in b) return <ul key={i}>{b.lista.map(x => <li key={x}>{x}</li>)}</ul>;
    if ('citacao' in b) return <blockquote key={i}>{b.citacao}</blockquote>;
    return b.tabela.map(t => [<h2 key={i + t.categoria}>{t.categoria}</h2>, <ul key={i + t.categoria + 'ul'}>{t.itens.map(x => <li key={x}>{x}</li>)}</ul>]);
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const todas = await getNoticias();
  const i = todas.findIndex(n => n.slug === slug);
  if (i < 0) notFound();
  const n = todas[i], prox = todas[i - 1], ant = todas[i + 1];
  return (<>
    <Header page="noticia" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], ['/noticias', 'Notícias'], [null, n.titulo]]} />
      <article>
        <header className="article-head wrap"><time className="date" dateTime={n.data}>Publicado em {dlong(n.data)}</time><h1>{n.titulo}</h1><p className="lead">{n.resumo}</p></header>
        <figure className="article-fig wrap"><div className="photo"><img src={'/assets/img/' + n.imagem} alt={n.alt} /></div></figure>
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
