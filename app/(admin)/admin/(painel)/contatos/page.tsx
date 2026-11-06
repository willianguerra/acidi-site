import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarContatos, FORMULARIOS, type Formulario, type LinhaContato } from '@/lib/admin/contatos';
import { lerPagina, urlCom } from '@/lib/admin/lista';
import { quando } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Filtros } from '@/components/admin/Filtros';
import { AcoesLinha } from '@/components/admin/AcoesLinha';
import { Tabela } from '@/components/admin/Tabela';
import { Paginacao } from '@/components/admin/Paginacao';
import { Aviso } from '@/components/admin/Aviso';
import { BarraMassa } from '@/components/admin/BarraMassa';
import { contatosMassa } from './acoes';

export const metadata = { title: 'Mensagens' };

const CAMINHO = '/admin/contatos';
const cab = <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Mensagens' }]} titulo="Mensagens do site" descricao="O que chega pelos formulários de contato, associe-se e auditório." />;

export default async function Page({ searchParams }: { searchParams: Promise<{ lida?: string; formulario?: string; pagina?: string; msg?: string }> }) {
  const u = await exigirUsuario();
  const q = await searchParams;
  const lida = q.lida === 'sim' ? true : q.lida === 'nao' ? false : undefined;
  const formulario = q.formulario && q.formulario in FORMULARIOS ? q.formulario as Formulario : undefined;
  const params = { lida: lida === undefined ? undefined : q.lida, formulario, pagina: q.pagina };
  let r;
  try { r = await listarContatos(db, u, { lida, formulario, pagina: lerPagina(q.pagina) }); } catch {
    return <>{cab}<Aviso tipo="erro">Não foi possível carregar as mensagens. <a href={CAMINHO}>Tentar de novo</a></Aviso></>;
  }
  if (!r.ok) redirect('/admin');
  const { itens, total, pagina, novas, lidas } = r.valor;
  const aqui = urlCom(CAMINHO, params, { pagina: q.pagina });
  return (<>
    {cab}
    {q.msg && <Aviso tipo="ok">{q.msg.slice(0, 200)}</Aviso>}
    <CartaoLista titulo="Mensagens recebidas" total={total} filtros={<Filtros acao={CAMINHO}>
      <label className="sr" htmlFor="lida">Leitura</label>
      <select id="lida" name="lida" defaultValue={params.lida ?? ''}>
        <option value="">Todas ({novas + lidas})</option><option value="nao">Novas ({novas})</option><option value="sim">Lidas ({lidas})</option>
      </select>
      <label className="sr" htmlFor="formulario">Formulário</label>
      <select id="formulario" name="formulario" defaultValue={formulario ?? ''}>
        <option value="">Todos os formulários</option>
        {Object.entries(FORMULARIOS).map(([k, f]) => <option key={k} value={k}>{f.titulo}</option>)}
      </select>
    </Filtros>}>
    {itens.length > 0 && <BarraMassa acao={contatosMassa} nome="mensagens" volta={aqui}
      acoes={[{ valor: 'lida', rotulo: 'Marcar como lida' }, { valor: 'nao-lida', rotulo: 'Marcar como não lida' }, { valor: 'apagar', rotulo: 'Apagar', perigo: true }]} />}
    <Tabela<LinhaContato> selecionavel linhas={itens} chave={c => c.id} rotulo={c => c.nome}
      vazio={lida !== undefined || formulario ? <p className="vazio">Nenhuma mensagem com esses filtros. <a href={CAMINHO}>Limpar filtros</a></p> : <p className="vazio">Nenhuma mensagem recebida ainda.</p>}
      colunas={[
        { titulo: 'Remetente', classe: 'titulo', celula: c => <><a href={`/admin/contatos/${c.id}`}>{c.nome}</a>{!c.lida && <> <span className="selo nova">Nova</span></>}<span className="sub">{c.email}</span></> },
        { titulo: 'Formulário', celula: c => FORMULARIOS[c.formulario].titulo },
        { titulo: 'Recebida', classe: 'num', celula: c => quando(c.criadaEm) },
        { titulo: 'Ações', classe: 'col-acoes', celula: c => <AcoesLinha
          links={[{ href: `/admin/contatos/${c.id}`, rotulo: 'Abrir', icone: 'eye' }, { href: `mailto:${c.email}`, rotulo: 'Responder por e-mail', icone: 'mail' }]}
          apagar={{ acao: contatosMassa, id: c.id, nome: `mensagem de ${c.nome}`, volta: aqui }} /> },
      ]} />
    <Paginacao caminho={CAMINHO} params={params} pagina={pagina} total={total} />
    </CartaoLista>
  </>);
}
