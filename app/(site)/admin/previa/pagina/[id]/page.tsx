// Prévia de uma página (inclusive rascunho) com o mesmo molde público.
import { notFound } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterPagina } from '@/lib/admin/paginas';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CabecalhoPagina, SecaoTexto } from '@/components/Molde';
import type { ConteudoPagina } from '@/lib/types';

export const metadata = { title: 'Prévia', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirUsuario();
  const r = await obterPagina(db, u, (await params).id);
  if (!r.ok || r.valor.fixa === 'home') notFound();
  const p = r.valor, c = p.conteudo as ConteudoPagina;
  const [pai, href] = p.menu === 'acidi' ? ['A ACIDI', '/historico'] : p.menu === 'negocio' ? ['Para seu negócio', '/para-seu-negocio'] : [];
  return (<>
    <Header page={`/${p.slug}`} />
    <main id="conteudo">
      <nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li>{pai && <li><a href={href}>{pai}</a></li>}<li aria-current="page">{p.nome}</li></ol></nav>
      <CabecalhoPagina cab={c.cabecalho} />
      <SecaoTexto c={c} />
    </main>
    <Footer />
  </>);
}
