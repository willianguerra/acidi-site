import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs, PageHead, Story } from '@/components/blocos';
import { getNoticias } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Notícias' + SUF,
  description: 'Notícias da Associação Empresarial de Indaial: eventos, representatividade e ações para associados.',
};

export default async function Page() {
  const noticias = await getNoticias();
  return (<>
    <Header page="noticias" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], [null, 'Notícias']]} />
      <PageHead kicker="Acontece" title={<>Notícias <b>da ACIDI</b></>} lead="Eventos, iniciativas e ações de representatividade da associação, com a data original de cada publicação." />
      <section className="sec"><div className="wrap"><div className="news-list">{noticias.map((n, i) => <Story key={n.slug} n={n} cls={i === 0 ? 'story first' : 'story'} />)}</div></div></section>
    </main>
    <Footer />
  </>);
}
