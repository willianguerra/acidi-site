// Prévia de uma página (inclusive rascunho) com o mesmo molde público.
import { notFound } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterPagina } from '@/lib/admin/paginas';
import { PaginaDinamica } from '@/components/PaginaDinamica';
import type { ConteudoPagina } from '@/lib/types';

export const metadata = { title: 'Prévia', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirUsuario();
  const r = await obterPagina(db, u, (await params).id);
  if (!r.ok || r.valor.fixa) notFound();
  const { slug, nome, menu, conteudo } = r.valor;
  return <PaginaDinamica slug={slug} nome={nome} menu={menu} conteudo={conteudo as ConteudoPagina} />;
}
