// Prévia de uma notícia com o layout público (fica no grupo do site para usar o mesmo CSS e HTML).
import { notFound } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterNoticia } from '@/lib/admin/noticias';
import { Artigo } from '@/components/Artigo';

export const metadata = { title: 'Prévia', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirUsuario();
  const r = await obterNoticia(db, u, (await params).id);
  if (!r.ok) notFound();
  return <Artigo n={r.valor} />;
}
