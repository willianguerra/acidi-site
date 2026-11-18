import { Home } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Selo } from '@/components/admin/Selo';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarPaginas, type LinhaPagina } from '@/lib/admin/paginas';
import { SITUACOES } from '@/lib/admin/fluxo';
import { quando } from '@/lib/datas';
import { Ico } from '@/components/Ico';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { CartaoLista } from '@/components/admin/CartaoLista';
import { Busca, Filtros } from '@/components/admin/Filtros';
import { Tabela, type Coluna } from '@/components/admin/Tabela';
import { MenuLinha } from '@/components/admin/MenuLinha';
import { Mover } from '@/components/admin/Mover';
import { Aviso } from '@/components/admin/Aviso';
import { moverPaginaAcao, paginaLinha } from './acoes';

export const metadata = { title: 'Páginas' };

const OKS: Record<string, string> = { apagada: 'Página apagada.', tirada: 'Página tirada do ar. O conteúdo continua guardado aqui.', publicada: 'Página no ar.' };
const CAMINHO = '/admin/paginas';
const cab = <Cabecalho titulo="Páginas" descricao="Edite os textos das páginas do site e crie páginas novas." acao={{ href: '/admin/paginas/nova', rotulo: 'Nova página' }} />;

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; busca?: string; tipo?: string }> }) {
  const u = await exigirUsuario();
  let r: Awaited<ReturnType<typeof listarPaginas>>;
  try { r = await listarPaginas(db, u); } catch {
    return <>{cab}<Aviso tipo="erro">Não foi possível carregar a lista. <a href={CAMINHO}>Tentar de novo</a></Aviso></>;
  }
  if (!r.ok) redirect('/admin');
  const q = await searchParams;
  const busca = q.busca?.trim().toLowerCase() ?? '', tipo = q.tipo === 'fixas' || q.tipo === 'criadas' ? q.tipo : '';
  const todas = r.valor, home = todas.find(p => p.fixa === 'home');
  // shortcut: filtra em memória, o site tem poucas dezenas de páginas; a ordem (Mover) usa sempre o grupo inteiro
  const acha = (p: LinhaPagina) => !busca || p.nome.toLowerCase().includes(busca) || p.slug.includes(busca);
  const grupos: { titulo: string; todas: LinhaPagina[]; fixas?: boolean; mover?: boolean; nota?: string }[] = [
    { titulo: 'Páginas fixas do site', todas: todas.filter(p => p.fixa && p.fixa !== 'home'), fixas: true,
      nota: 'Fazem parte da estrutura do site: você edita o cabeçalho e os textos. Formulários, galerias e listas ligados a elas continuam fixos. Elas podem ser tiradas do ar (o endereço deixa de abrir e o link some do menu), mas não apagadas nem mudar de endereço.' },
    { titulo: 'Criadas por você · menu A ACIDI', todas: todas.filter(p => !p.fixa && p.menu === 'acidi'), mover: true },
    { titulo: 'Criadas por você · menu Para seu negócio', todas: todas.filter(p => !p.fixa && p.menu === 'negocio'), mover: true },
    { titulo: 'Criadas por você · fora do menu', todas: todas.filter(p => !p.fixa && !p.menu), nota: 'Publicadas, continuam acessíveis pelo endereço, mas não aparecem no menu do site.' },
  ].filter(g => !tipo || (tipo === 'fixas') === !!g.fixas);
  return (<>
    {cab}
    {q.ok && OKS[q.ok] && <Aviso tipo="ok">{OKS[q.ok]}</Aviso>}
    {q.ok === 'erro' && <Aviso tipo="erro">Não foi possível concluir a ação. Tente de novo.</Aviso>}
    {home && <Card className="mb-4 flex-row flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5">
      <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-md bg-accent text-accent-foreground"><Home className="size-[18px]" /></span>
      <div className="min-w-0 flex-[1_1_220px]"><h2 className="font-display text-[1.0625rem] leading-tight font-bold">Página inicial</h2>
        <p className="meta">Endereço / · última alteração em {quando(home.atualizadaEm)}</p></div>
      <Selo s={home.situacao}>{SITUACOES[home.situacao]}</Selo>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm"><a href="/" target="_blank" rel="noopener"><Ico n="ext" cls="ico size-4" />Ver no site<span className="sr-only"> (abre em nova aba)</span></a></Button>
        <Button asChild size="sm"><a href="/admin/paginas/home"><Ico n="edit" cls="ico size-4" />Editar<span className="sr-only"> a página inicial</span></a></Button>
      </div>
    </Card>}
    <Card className="mb-4 p-0 [&>form]:border-b-0"><Filtros acao={CAMINHO}>
      <Busca rotulo="Pesquisar por nome ou endereço" valor={q.busca?.trim()} />
      <label className="sr-only" htmlFor="tipo">Tipo de página</label>
      <NativeSelect id="tipo" name="tipo" defaultValue={tipo}><option value="">Todos os tipos</option><option value="fixas">Fixas do site</option><option value="criadas">Criadas por você</option></NativeSelect>
    </Filtros></Card>
    {grupos.map(g => {
      const linhas = g.todas.filter(acha);
      const colunas: Coluna<LinhaPagina>[] = [
        { titulo: 'Nome', classe: 'titulo', largura: 'md:w-[32%]', celula: p => <a href={`/admin/paginas/${p.id}`}>{p.nome}</a> },
        { titulo: 'Endereço', classe: 'num', largura: 'md:w-[22%]', celula: p => '/' + p.slug },
        { titulo: 'Situação', largura: 'md:w-[12%]', celula: p => <Selo s={p.situacao}>{SITUACOES[p.situacao]}</Selo> },
        { titulo: 'Última alteração', classe: 'num', celula: p => quando(p.atualizadaEm) },
        ...(g.mover ? [{ titulo: 'Ordem no menu', classe: 'col-acoes' as const, largura: 'md:w-32', celula: (p: LinhaPagina) => {
          const i = g.todas.indexOf(p);
          return <Mover id={p.id} nome={p.nome} acao={moverPaginaAcao} primeiro={i === 0} ultimo={i === g.todas.length - 1} />;
        } }] : []),
        { titulo: 'Ações', classe: 'col-acoes', largura: 'md:w-20', celula: p => <MenuLinha nome={p.nome} links={[
          { href: `/admin/paginas/${p.id}`, rotulo: 'Editar', icone: 'edit' },
          // publicada abre no site; rascunho criado por você abre a prévia (a prévia só existe para páginas dinâmicas)
          ...(p.situacao === 'publicada' ? [{ href: '/' + p.slug, rotulo: 'Ver no site', icone: 'ext' as const, novaAba: true }]
            : !p.fixa ? [{ href: `/admin/previa/pagina/${p.id}`, rotulo: 'Prévia', icone: 'eye' as const, novaAba: true }] : []),
        ]}
          acoes={{ acao: paginaLinha, id: p.id, volta: CAMINHO, itens: [p.situacao === 'publicada'
            ? { valor: 'tirar', rotulo: 'Tirar do ar', confirma: `Tirar "${p.nome}" do ar? O endereço /${p.slug} deixa de abrir no site. O conteúdo fica guardado e você pode colocar de volta.` }
            : { valor: 'publicar', rotulo: 'Colocar no ar' }] }}
          apagar={p.fixa ? undefined : { acao: paginaLinha, id: p.id, nome: p.nome, volta: CAMINHO }} /> },
      ];
      return (<CartaoLista key={g.titulo} titulo={g.titulo} total={linhas.length} nota={g.nota}>
        <Tabela<LinhaPagina> colunas={colunas} linhas={linhas} chave={p => p.id} rotulo={p => p.nome}
          vazio={busca ? <p className="vazio">Nenhuma página com essa busca. <a href={CAMINHO}>Limpar busca</a></p>
            : <p className="vazio">Nenhuma página aqui. <a href="/admin/paginas/nova">Nova página</a></p>} />
      </CartaoLista>);
    })}
  </>);
}
