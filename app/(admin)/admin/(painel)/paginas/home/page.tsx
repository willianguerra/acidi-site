import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterPaginaFixa } from '@/lib/admin/paginas';
import { FormHome } from '@/components/admin/FormHome';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';
import type { ConteudoHome } from '@/lib/types';

export const metadata = { title: 'Editar Home' };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await exigirUsuario();
  const r = await obterPaginaFixa(db, u, 'home');
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const ok = (await searchParams).ok;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/paginas', rotulo: 'Páginas' }, { rotulo: 'Home' }]} titulo="Home"
      descricao="Textos da página inicial, na ordem em que aparecem. Salvar já publica." extra={<a className="bt sec" href="/" target="_blank" rel="noopener">Ver no site<span className="sr"> (abre em nova aba)</span></a>} />
    {ok === 'salva' && <Aviso tipo="ok">Home atualizada no site.</Aviso>}
    <FormHome c={r.valor.conteudo as ConteudoHome} id={r.valor.id} lidaEm={r.valor.atualizadaEm.toISOString()} />
  </>);
}
