import { notFound } from 'next/navigation';
import { Artigo } from '@/components/Artigo';
import { getNoticias, getNoticia } from '@/lib/content';
import { pagina, jsonLd, ORGANIZACAO, SITE } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const n = await getNoticia((await params).slug);
  return n ? pagina('/noticias/' + n.slug, n.titulo, n.resumo, { imagem: n.imagem, tipo: 'article', publicado: n.data }) : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const todas = await getNoticias();
  const i = todas.findIndex(n => n.slug === slug);
  if (i < 0) notFound();
  const n = todas[i];
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
      '@type': 'NewsArticle', headline: n.titulo, description: n.resumo, image: [new URL(n.imagem, SITE).href], datePublished: n.data,
      mainEntityOfPage: SITE + '/noticias/' + n.slug, author: { '@id': ORGANIZACAO['@id'] }, publisher: ORGANIZACAO,
    })} />
    <Artigo n={n} prox={todas[i - 1]} ant={todas[i + 1]} />
  </>);
}
