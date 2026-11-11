import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getPaginaPublicada } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina, SecaoTexto } from '@/components/Molde';

type Props = { params: Promise<{ pagina: string }> };

export async function generateMetadata({ params }: Props) {
  const slug = (await params).pagina;
  const p = await getPaginaPublicada(slug);
  if (!p) notFound();
  return pagina('/' + slug, p.nome, p.descricao);
}

export default async function Page({ params }: Props) {
  const slug = (await params).pagina;
  const p = await getPaginaPublicada(slug);
  if (!p) notFound();
  const c = p.conteudo;
  const [pai, href] = p.menu === 'acidi' ? ['A ACIDI', '/historico'] : p.menu === 'negocio' ? ['Para seu negócio', '/para-seu-negocio'] : [];
  return (<>
    <Header page={`/${slug}`} />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li>{pai && <li><a href={href}>{pai}</a></li>}<li aria-current="page">{p.nome}</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
<SecaoTexto c={c} />
    </main>
    <Footer />
  </>);
}
