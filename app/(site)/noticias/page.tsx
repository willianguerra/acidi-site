import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs, Story } from '@/components/blocos';
import { getNoticias, getPaginaFixa } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('noticias');
  return pagina('/noticias', p.nome, p.descricao);
}

export default async function Page() {
  const c = (await getPaginaFixa('noticias')).conteudo;
  const noticias = await getNoticias();
  return (<>
    <Header page="noticias" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], [null, 'Notícias']]} />
      <CabecalhoPagina cab={c.cabecalho} />
      <section className="sec"><div className="wrap"><div className="news-list">{noticias.map((n, i) => <Story key={n.slug} n={n} cls={i === 0 ? 'story first' : 'story'} />)}</div></div></section>
    </main>
    <Footer />
  </>);
}
