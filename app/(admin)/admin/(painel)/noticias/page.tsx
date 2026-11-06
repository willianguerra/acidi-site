import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarNoticias } from '@/lib/admin/noticias';
import { SITUACOES, type Situacao } from '@/lib/admin/fluxo';
import { dshort } from '@/lib/datas';

export const metadata = { title: 'Notícias' };

const OKS: Record<string, string> = { apagada: 'Notícia apagada.' };

type Props = { searchParams: Promise<{ situacao?: string; busca?: string; ok?: string }> };

export default async function Page({ searchParams }: Props) {
  const u = await exigirUsuario();
  const q = await searchParams;
  const situacao = q.situacao && q.situacao in SITUACOES ? q.situacao as Situacao : undefined;
  const r = await listarNoticias(db, u, { situacao, busca: q.busca });
  const lista = r.ok ? r.valor.itens : [];
  return (<>
    <div className="cabeca"><h1>Notícias</h1><a className="bt" href="/admin/noticias/nova">Nova notícia</a></div>
    {q.ok && OKS[q.ok] && <p className="aviso ok" role="status">{OKS[q.ok]}</p>}
    {!r.ok && <p className="aviso" role="alert">Você não tem acesso às notícias.</p>}
    <div className="cartao">
      <form className="filtros" role="search">
        <label className="sr" htmlFor="busca">Buscar por título</label>
        <input type="search" id="busca" name="busca" placeholder="Buscar por título" defaultValue={q.busca ?? ''} />
        <label className="sr" htmlFor="situacao">Situação</label>
        <select id="situacao" name="situacao" defaultValue={situacao ?? ''}>
          <option value="">Todas as situações</option>
          {Object.entries(SITUACOES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="bt sec" type="submit" style={{ flex: '0 0 auto' }}>Filtrar</button>
      </form>
      {lista.length ? <ul className="lista">{lista.map(n => (
        <li key={n.id}>
          <span><a href={`/admin/noticias/${n.id}`}>{n.titulo}</a><br /><span className="meta">{dshort(n.data)}{n.autor && ' · ' + n.autor}</span></span>
          <span className={'selo ' + n.situacao}>{SITUACOES[n.situacao]}</span>
        </li>))}</ul>
        : <p className="vazio">Nenhuma notícia encontrada.</p>}
    </div>
  </>);
}
