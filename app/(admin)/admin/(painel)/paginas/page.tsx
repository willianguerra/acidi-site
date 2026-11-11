import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarPaginas, type LinhaPagina } from '@/lib/admin/paginas';
import { SITUACOES } from '@/lib/admin/fluxo';
import { quando } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Tabela, type Coluna } from '@/components/admin/Tabela';
import { Mover } from '@/components/admin/Mover';
import { Aviso } from '@/components/admin/Aviso';
import { moverPaginaAcao } from './acoes';

export const metadata = { title: 'Páginas' };

const OKS: Record<string, string> = { apagada: 'Página apagada.' };
const cab = <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Páginas' }]} titulo="Páginas"
  descricao="Texto das páginas do site e páginas novas." acao={{ href: '/admin/paginas/nova', rotulo: 'Nova página' }} />;

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await exigirUsuario();
  let r: Awaited<ReturnType<typeof listarPaginas>>;
  try { r = await listarPaginas(db, u); } catch {
    return <>{cab}<Aviso tipo="erro">Não foi possível carregar a lista. <a href="/admin/paginas">Tentar de novo</a></Aviso></>;
  }
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok;
  const todas = r.valor;
  const grupos: { titulo: string; linhas: LinhaPagina[]; mover?: boolean }[] = [
    { titulo: 'Home', linhas: todas.filter(p => p.fixa === 'home') },
    { titulo: 'Páginas fixas', linhas: todas.filter(p => p.fixa && p.fixa !== 'home') },
    { titulo: 'A ACIDI', linhas: todas.filter(p => !p.fixa && p.menu === 'acidi'), mover: true },
    { titulo: 'Para seu negócio', linhas: todas.filter(p => !p.fixa && p.menu === 'negocio'), mover: true },
    { titulo: 'Fora do menu', linhas: todas.filter(p => !p.fixa && !p.menu) },
  ];
  return (<>
    {cab}
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
    {grupos.filter(g => g.linhas.length || g.titulo === 'Fora do menu').map(g => {
      const colunas: Coluna<LinhaPagina>[] = [
        { titulo: 'Nome', classe: 'titulo', celula: p => <a href={p.fixa === 'home' ? '/admin/paginas/home' : `/admin/paginas/${p.id}`}>{p.nome}</a> },
        { titulo: 'Endereço', celula: p => p.fixa === 'home' ? '/' : '/' + p.slug },
        { titulo: 'Situação', celula: p => <span className={'selo ' + p.situacao}>{SITUACOES[p.situacao]}</span> },
        { titulo: 'Última alteração', celula: p => quando(p.atualizadaEm) },
        ...(g.mover ? [{ titulo: 'Ordem', classe: 'col-acoes', celula: (p: LinhaPagina) => {
          const i = g.linhas.indexOf(p);
          return <Mover id={p.id} nome={p.nome} acao={moverPaginaAcao} primeiro={i === 0} ultimo={i === g.linhas.length - 1} />;
        } }] : []),
      ];
      return (<CartaoLista key={g.titulo} titulo={g.titulo} total={g.linhas.length}>
        <Tabela<LinhaPagina> colunas={colunas} linhas={g.linhas} chave={p => p.id} rotulo={p => p.nome}
          vazio={<p className="vazio">Nenhuma página aqui. <a href="/admin/paginas/nova">Nova página</a></p>} />
      </CartaoLista>);
    })}
  </>);
}
