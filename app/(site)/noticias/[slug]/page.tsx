import { notFound } from 'next/navigation';
import { Artigo } from '@/components/Artigo';
import { getNoticias, getNoticia } from '@/lib/content';
import { SUF } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getNoticias()).map(n => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props) {
  const n = await getNoticia((await params).slug);
  return n ? { title: n.titulo + SUF, description: n.resumo } : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const todas = await getNoticias();
  const i = todas.findIndex(n => n.slug === slug);
  if (i < 0) notFound();
  return <Artigo n={todas[i]} prox={todas[i - 1]} ant={todas[i + 1]} />;
}
