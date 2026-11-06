import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarNoticias, autoresDeNoticias, anosDeNoticias, type ItemLista } from '@/lib/admin/noticias';
import { SITUACOES, type Situacao } from '@/lib/admin/fluxo';
import { pode } from '@/lib/admin/permissoes';
import { lerPagina, urlCom } from '@/lib/admin/lista';
import { dshort } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Abas } from '@/components/admin/Abas';
import { Tabela } from '@/components/admin/Tabela';
import { Paginacao } from '@/components/admin/Paginacao';
import { Aviso } from '@/components/admin/Aviso';
import { BarraMassa } from '@/components/admin/BarraMassa';
import { noticiasMassa } from './acoes';

export const metadata = { title: 'Notícias' };

const OKS: Record<string, string> = { apagada: 'Notícia apagada.' };
const CAMINHO = '/admin/noticias';

type Q = { situacao?: string; busca?: string; autor?: string; ano?: string; pagina?: string; ok?: string; msg?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Q> }) {
  const u = await exigirUsuario();
  const q = await searchParams;
  const situacao = q.situacao && q.situacao in SITUACOES ? q.situacao as Situacao : undefined;
  const ano = q.ano && /^\d{4}$/.test(q.ano) ? Number(q.ano) : undefined;
  const params = { situacao, busca: q.busca?.trim() || undefined, autor: q.autor || undefined, ano: ano ? String(ano) : undefined, pagina: q.pagina };
  let r: Awaited<ReturnType<typeof listarNoticias>>, autores: { id: string; nome: string }[] = [], anos: number[] = [];
  try {
    r = await listarNoticias(db, u, { situacao, busca: params.busca, autorId: params.autor, ano, pagina: lerPagina(q.pagina) });
    [autores, anos] = await Promise.all([autoresDeNoticias(db, u), anosDeNoticias(db, u)]);
  } catch {
    return (<><Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Notícias' }]} titulo="Notícias" />
      <Aviso tipo="erro">Não foi possível carregar a lista. <a href={urlCom(CAMINHO, params, { pagina: params.pagina })}>Tentar de novo</a></Aviso></>);
  }
  const cab = <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Notícias' }]} titulo="Notícias" acao={{ href: '/admin/noticias/nova', rotulo: 'Nova notícia' }} />;
  if (!r.ok) return <>{cab}<Aviso tipo="erro">Você não tem acesso às notícias.</Aviso></>;
  const { itens, total, pagina, porSituacao } = r.valor;
  const todas = Object.values(porSituacao).reduce((a, b) => a + b, 0);
  const filtrando = !!(params.busca || params.autor || ano);
  const revisa = pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' });
  const acoes = [...(revisa ? [{ valor: 'publicar', rotulo: 'Publicar' }, { valor: 'despublicar', rotulo: 'Despublicar' }] : []), { valor: 'apagar', rotulo: 'Apagar', perigo: true }];

  return (<>
    {cab}
    {q.ok && OKS[q.ok] && <Aviso tipo="ok">{OKS[q.ok]}</Aviso>}
    {q.msg && <Aviso tipo="ok">{q.msg.slice(0, 200)}</Aviso>}
    <Abas caminho={CAMINHO} params={params} chave="situacao" rotulo="Situação"
      abas={[{ rotulo: 'Todas', total: todas }, ...Object.entries(SITUACOES).map(([k, v]) => ({ valor: k, rotulo: v, total: porSituacao[k as Situacao] }))]} />
    <form className="filtros" role="search" action={CAMINHO}>
      {situacao && <input type="hidden" name="situacao" value={situacao} />}
      <label className="sr" htmlFor="busca">Buscar por título</label>
      <input type="search" id="busca" name="busca" placeholder="Buscar por título" defaultValue={params.busca ?? ''} />
      {autores.length > 1 && <><label className="sr" htmlFor="autor">Autor</label>
        <select id="autor" name="autor" defaultValue={params.autor ?? ''}><option value="">Todos os autores</option>{autores.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></>}
      {anos.length > 1 && <><label className="sr" htmlFor="ano">Ano</label>
        <select id="ano" name="ano" defaultValue={params.ano ?? ''}><option value="">Todos os anos</option>{anos.map(a => <option key={a} value={a}>{a}</option>)}</select></>}
      <button className="bt sec" type="submit" style={{ flex: '0 0 auto' }}>Filtrar</button>
    </form>
    {itens.length > 0 && <BarraMassa acao={noticiasMassa} acoes={acoes} nome="notícias" volta={urlCom(CAMINHO, params, { pagina: params.pagina })} />}
    <Tabela<ItemLista> selecionavel linhas={itens} chave={n => n.id} rotulo={n => n.titulo}
      vazio={filtrando || situacao
        ? <p className="vazio">Nenhuma notícia com esses filtros. <a href={CAMINHO}>Limpar filtros</a></p>
        : <p className="vazio">Comece escrevendo a primeira notícia. <a href="/admin/noticias/nova">Nova notícia</a></p>}
      colunas={[
        { titulo: 'Título', classe: 'titulo', celula: n => <>
          {n.imagem && <img className="mini" src={n.imagem} alt="" loading="lazy" />}
          <a href={`/admin/noticias/${n.id}`}>{n.titulo}</a>
          <span className="acoes-linha"><a href={`/admin/noticias/${n.id}`}>Editar</a><a href={`/admin/previa/${n.id}`}>Prévia</a>{n.situacao === 'publicada' && <a href={`/noticias/${n.slug}`}>Ver no site</a>}</span>
        </> },
        { titulo: 'Autor', celula: n => n.autor ?? '—' },
        { titulo: 'Data', classe: 'num', celula: n => dshort(n.data) },
        { titulo: 'Situação', celula: n => <span className={'selo ' + n.situacao}>{SITUACOES[n.situacao]}</span> },
      ]} />
    <Paginacao caminho={CAMINHO} params={params} pagina={pagina} total={total} />
  </>);
}
