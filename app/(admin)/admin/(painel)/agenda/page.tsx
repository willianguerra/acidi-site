import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarEventos, type LinhaEvento } from '@/lib/admin/eventos';
import { lerPagina, paginar, urlCom } from '@/lib/admin/lista';
import { dshort, hojeIso } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Filtros } from '@/components/admin/Filtros';
import { AcoesLinha } from '@/components/admin/AcoesLinha';
import { Tabela } from '@/components/admin/Tabela';
import { Paginacao } from '@/components/admin/Paginacao';
import { Aviso } from '@/components/admin/Aviso';
import { BarraMassa } from '@/components/admin/BarraMassa';
import { eventosMassa } from './acoes';

export const metadata = { title: 'Agenda' };

const OKS: Record<string, string> = { salvo: 'Evento salvo: a agenda do site já foi atualizada.', apagado: 'Evento apagado.' };
const CAMINHO = '/admin/agenda';
const cab = <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Agenda' }]} titulo="Agenda" descricao="Eventos que aparecem na agenda e na home do site." acao={{ href: '/admin/agenda/novo', rotulo: 'Novo evento' }} />;

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; msg?: string; aba?: string; pagina?: string }> }) {
  const u = await exigirUsuario();
  const q = await searchParams;
  let r;
  try { r = await listarEventos(db, u); } catch {
    return <>{cab}<Aviso tipo="erro">Não foi possível carregar a agenda. <a href={CAMINHO}>Tentar de novo</a></Aviso></>;
  }
  if (!r.ok) redirect('/admin');
  const hoje = hojeIso();
  const passados = q.aba === 'passados';
  const prox = r.valor.filter(e => e.data >= hoje), pass = r.valor.filter(e => e.data < hoje).reverse();
  const params = { aba: passados ? 'passados' : undefined, pagina: q.pagina };
  // shortcut: pagina em memória, a agenda tem poucas dezenas de eventos; mover para o banco se passar de algumas centenas
  const p = paginar(passados ? pass : prox, lerPagina(q.pagina));
  const aqui = urlCom(CAMINHO, params, { pagina: q.pagina });
  return (<>
    {cab}
    {q.ok && OKS[q.ok] && <Aviso tipo="ok">{OKS[q.ok]}</Aviso>}
    {q.msg && <Aviso tipo="ok">{q.msg.slice(0, 200)}</Aviso>}
    <CartaoLista titulo="Eventos cadastrados" total={p.total} filtros={<Filtros acao={CAMINHO}>
      <label className="sr" htmlFor="aba">Período</label>
      <select id="aba" name="aba" defaultValue={params.aba ?? ''}>
        <option value="">Próximos ({prox.length})</option><option value="passados">Passados ({pass.length})</option>
      </select>
    </Filtros>}>
    {p.itens.length > 0 && <BarraMassa acao={eventosMassa} acoes={[{ valor: 'apagar', rotulo: 'Apagar', perigo: true }]} nome="eventos" volta={aqui} />}
    <Tabela<LinhaEvento> selecionavel linhas={p.itens} chave={e => e.id} rotulo={e => e.titulo}
      vazio={passados ? <p className="vazio">Nenhum evento passado.</p> : <p className="vazio">Nenhum evento futuro. <a href="/admin/agenda/novo">Novo evento</a></p>}
      colunas={[
        { titulo: 'Evento', classe: 'titulo', celula: e => <><a href={`/admin/agenda/${e.id}`}>{e.titulo}</a><span className="sub">{e.descricao.slice(0, 90)}{e.descricao.length > 90 ? '…' : ''}</span></> },
        { titulo: 'Data', classe: 'num', celula: e => dshort(e.data) },
        { titulo: 'Horário', classe: 'num', celula: e => e.horario || '—' },
        { titulo: 'Local', celula: e => e.local },
        { titulo: 'Ações', classe: 'col-acoes', celula: e => <AcoesLinha links={[{ href: `/admin/agenda/${e.id}`, rotulo: 'Editar', icone: 'edit' }]}
          apagar={{ acao: eventosMassa, id: e.id, nome: e.titulo, volta: aqui }} /> },
      ]} />
    <Paginacao caminho={CAMINHO} params={params} pagina={p.pagina} total={p.total} />
    </CartaoLista>
  </>);
}
