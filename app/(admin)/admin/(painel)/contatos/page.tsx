import { NativeSelect } from '@/components/ui/native-select';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarContatos, FORMULARIOS, type Formulario, type LinhaContato } from '@/lib/admin/contatos';
import { lerPagina, urlCom } from '@/lib/admin/lista';
import { quando } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Filtros } from '@/components/admin/Filtros';
import { Abas } from '@/components/admin/Abas';
import { AcoesLinha } from '@/components/admin/AcoesLinha';
import { Tabela } from '@/components/admin/Tabela';
import { Paginacao } from '@/components/admin/Paginacao';
import { Aviso } from '@/components/admin/Aviso';
import { BarraMassa } from '@/components/admin/BarraMassa';
import { contatosMassa } from './acoes';

export const metadata = { title: 'Mensagens' };

const CAMINHO = '/admin/contatos';
const cab = <Cabecalho titulo="Mensagens" descricao="O que chega pelos formulários de contato, associe-se e auditório." />;

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
    <CartaoLista titulo="Mensagens recebidas"
      abas={<Abas rotulo="Leitura" itens={[
        { href: urlCom(CAMINHO, params, { lida: undefined }), rotulo: 'Todas', n: novas + lidas, atual: lida === undefined },
        { href: urlCom(CAMINHO, params, { lida: 'nao' }), rotulo: 'Não lidas', n: novas, atual: lida === false },
        { href: urlCom(CAMINHO, params, { lida: 'sim' }), rotulo: 'Lidas', n: lidas, atual: lida === true },
      ]} />}
      filtros={<Filtros acao={CAMINHO} fixos={{ lida: params.lida }}>
        <label className="sr-only" htmlFor="formulario">Formulário</label>
        <NativeSelect id="formulario" name="formulario" defaultValue={formulario ?? ''}>
          <option value="">Todos os formulários</option>
          {Object.entries(FORMULARIOS).map(([k, f]) => <option key={k} value={k}>{f.titulo}</option>)}
        </NativeSelect>
      </Filtros>}>
    {itens.length > 0 && <BarraMassa acao={contatosMassa} nome="mensagens" volta={aqui}
      acoes={[{ valor: 'lida', rotulo: 'Marcar como lida' }, { valor: 'nao-lida', rotulo: 'Marcar como não lida' }, { valor: 'apagar', rotulo: 'Apagar', perigo: true }]} />}
    <Tabela<LinhaContato> selecionavel classeLinha={c => (c.lida ? undefined : 'bg-ok-soft/40')} linhas={itens} chave={c => c.id} rotulo={c => c.nome}
      vazio={lida !== undefined || formulario ? <p className="vazio">Nenhuma mensagem com esses filtros. <a href={CAMINHO}>Limpar filtros</a></p> : <p className="vazio">Nenhuma mensagem recebida ainda.</p>}
      colunas={[
        { titulo: 'Remetente', classe: 'titulo', celula: c => <div className="flex items-center gap-3">
          <span className={'size-2 flex-none rounded-full ' + (c.lida ? '' : 'bg-primary')}>{!c.lida && <span className="sr-only">Não lida: </span>}</span>
          <div className="min-w-0"><a href={`/admin/contatos/${c.id}`} className={c.lida ? 'font-medium!' : 'font-bold!'}>{c.nome}</a><span className="sub">{c.email}</span></div>
        </div> },
        { titulo: 'Formulário', celula: c => FORMULARIOS[c.formulario].titulo },
        { titulo: 'Recebida', classe: 'num', celula: c => quando(c.criadaEm) },
        { titulo: 'Ações', classe: 'col-acoes', celula: c => <AcoesLinha nome={`mensagem de ${c.nome}`}
          links={[{ href: `/admin/contatos/${c.id}`, rotulo: 'Abrir', icone: 'eye', onde: 'texto' }, { href: `mailto:${c.email}`, rotulo: 'Responder por e-mail', icone: 'mail' }]}
          apagar={{ acao: contatosMassa, id: c.id, nome: `mensagem de ${c.nome}`, volta: aqui }} /> },
      ]} />
    <Paginacao caminho={CAMINHO} params={params} pagina={pagina} total={total} nome="mensagens" />
    </CartaoLista>
  </>);
}
