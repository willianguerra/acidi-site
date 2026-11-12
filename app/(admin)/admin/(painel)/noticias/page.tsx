import { ImageIcon } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import { Selo } from '@/components/admin/Selo';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarNoticias, autoresDeNoticias, anosDeNoticias, type ItemLista } from '@/lib/admin/noticias';
import { SITUACOES, type Situacao } from '@/lib/admin/fluxo';
import { pode } from '@/lib/admin/permissoes';
import { lerPagina, urlCom } from '@/lib/admin/lista';
import { dshort, quando } from '@/lib/datas';
import { Ico } from '@/components/Ico';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Busca, Filtros } from '@/components/admin/Filtros';
import { Abas } from '@/components/admin/Abas';
import { Tabela } from '@/components/admin/Tabela';
import { Paginacao } from '@/components/admin/Paginacao';
import { Aviso } from '@/components/admin/Aviso';
import { BarraMassa } from '@/components/admin/BarraMassa';
import { AcoesLinha } from '@/components/admin/AcoesLinha';
import { noticiasMassa } from './acoes';

export const metadata = { title: 'Notícias' };

const OKS: Record<string, string> = { apagada: 'Notícia apagada.' };
const CAMINHO = '/admin/noticias';
const ABAS: Record<Situacao, string> = { rascunho: 'Rascunhos', revisao: 'Em revisão', publicada: 'Publicadas', devolvida: 'Devolvidas' };
const cab = <Cabecalho titulo="Notícias"
  descricao="Escreva, revise e publique as notícias do site." acao={{ href: '/admin/noticias/nova', rotulo: 'Nova notícia' }} />;

type Q = { situacao?: string; busca?: string; autor?: string; ano?: string; pagina?: string; ok?: string; msg?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Q> }) {
  const u = await exigirUsuario();
  const q = await searchParams;
  const situacao = q.situacao && q.situacao in SITUACOES ? q.situacao as Situacao : undefined;
  const ano = q.ano && /^\d{4}$/.test(q.ano) ? Number(q.ano) : undefined;
  const params = { situacao, busca: q.busca?.trim() || undefined, autor: q.autor || undefined, ano: ano ? String(ano) : undefined, pagina: q.pagina };
  const aqui = urlCom(CAMINHO, params, { pagina: params.pagina });
  let r: Awaited<ReturnType<typeof listarNoticias>>, autores: { id: string; nome: string }[] = [], anos: number[] = [];
  try {
    r = await listarNoticias(db, u, { situacao, busca: params.busca, autorId: params.autor, ano, pagina: lerPagina(q.pagina) });
    [autores, anos] = await Promise.all([autoresDeNoticias(db, u), anosDeNoticias(db, u)]);
  } catch {
    return <>{cab}<Aviso tipo="erro">Não foi possível carregar a lista. <a href={aqui}>Tentar de novo</a></Aviso></>;
  }
  if (!r.ok) return <>{cab}<Aviso tipo="erro">Você não tem acesso às notícias.</Aviso></>;
  const { itens, total, pagina, porSituacao } = r.valor;
  const todas = Object.values(porSituacao).reduce((a, b) => a + b, 0);
  const revisa = pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' });
  const acoes = [...(revisa ? [{ valor: 'publicar', rotulo: 'Publicar' }, { valor: 'despublicar', rotulo: 'Despublicar' }] : []), { valor: 'apagar', rotulo: 'Apagar', perigo: true }];

  return (<>
    {cab}
    {q.ok && OKS[q.ok] && <Aviso tipo="ok">{OKS[q.ok]}</Aviso>}
    {q.msg && <Aviso tipo="ok">{q.msg.slice(0, 200)}</Aviso>}
    <CartaoLista titulo="Notícias cadastradas"
      abas={<Abas rotulo="Situação" itens={[
        { href: urlCom(CAMINHO, params, { situacao: undefined }), rotulo: 'Todas', n: todas, atual: !situacao },
        ...Object.entries(ABAS).map(([k, v]) => ({ href: urlCom(CAMINHO, params, { situacao: k }), rotulo: v, n: porSituacao[k as Situacao], atual: situacao === k })),
      ]} />}
      filtros={<Filtros acao={CAMINHO} fixos={{ situacao }}>
        <Busca rotulo="Pesquisar por título" valor={params.busca} />
        {autores.length > 1 && <><label className="sr-only" htmlFor="autor">Autor</label>
          <NativeSelect id="autor" name="autor" defaultValue={params.autor ?? ''}><option value="">Todos os autores</option>{autores.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</NativeSelect></>}
        {anos.length > 1 && <><label className="sr-only" htmlFor="ano">Ano</label>
          <NativeSelect id="ano" name="ano" defaultValue={params.ano ?? ''}><option value="">Todos os anos</option>{anos.map(a => <option key={a} value={a}>{a}</option>)}</NativeSelect></>}
      </Filtros>}>
      {itens.length > 0 && <BarraMassa acao={noticiasMassa} acoes={acoes} nome="notícias" volta={aqui} />}
      <Tabela<ItemLista> selecionavel linhas={itens} chave={n => n.id} rotulo={n => n.titulo}
        vazio={params.busca || params.autor || ano || situacao
          ? <p className="vazio">Nenhuma notícia com esses filtros. <a href={CAMINHO}>Limpar filtros</a></p>
          : <p className="vazio">Comece escrevendo a primeira notícia. <a href="/admin/noticias/nova">Nova notícia</a></p>}
        colunas={[
          { titulo: 'Notícia', classe: 'titulo', celula: n => <div className="flex items-center gap-3">
            {n.imagem ? <img className="h-10 w-14 flex-none rounded-md bg-accent object-cover" src={n.imagem} alt="" loading="lazy" />
              : <span aria-hidden="true" className="grid h-10 w-14 flex-none place-items-center rounded-md bg-accent text-accent-foreground/60"><ImageIcon className="size-4" /></span>}
            <div className="min-w-0"><a href={`/admin/noticias/${n.id}`}>{n.titulo}</a>
              <span className="sub"><Ico n="user" cls="ico inline size-3.5 align-[-2px]" /> {n.autor ?? 'Sem autor'} · atualizada {quando(n.atualizadaEm)}</span></div>
          </div> },
          { titulo: 'Situação', celula: n => <Selo s={n.situacao}>{SITUACOES[n.situacao]}</Selo> },
          { titulo: 'Data', classe: 'num', celula: n => dshort(n.data) },
          { titulo: 'Ações', classe: 'col-acoes', celula: n => <AcoesLinha nome={n.titulo}
            links={[{ href: `/admin/noticias/${n.id}`, rotulo: 'Editar', icone: 'edit', onde: 'texto' },
              n.situacao === 'publicada' ? { href: `/noticias/${n.slug}`, rotulo: 'Ver no site', icone: 'ext', novaAba: true } : { href: `/admin/previa/${n.id}`, rotulo: 'Prévia', icone: 'eye', novaAba: true },
              ...(n.situacao === 'publicada' ? [{ href: `/admin/previa/${n.id}`, rotulo: 'Prévia', icone: 'eye' as const, novaAba: true, onde: 'menu' as const }] : [])]}
            apagar={pode(u, 'noticia.apagar', { autorId: n.autorId, situacao: n.situacao }) ? { acao: noticiasMassa, id: n.id, nome: n.titulo, volta: aqui } : undefined} /> },
        ]} />
      <Paginacao caminho={CAMINHO} params={params} pagina={pagina} total={total} nome="notícias" />
    </CartaoLista>
  </>);
}
