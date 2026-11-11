import { notFound } from 'next/navigation';
import { PaginaDinamica } from '@/components/PaginaDinamica';
import { getPaginaPublicada } from '@/lib/content';
import { pagina } from '@/lib/meta';

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
  return <PaginaDinamica {...p} />;
}
