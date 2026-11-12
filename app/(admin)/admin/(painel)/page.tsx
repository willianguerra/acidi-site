import { ArrowRight, CalendarDays, CircleCheck, ExternalLink, FileText, Mail, Newspaper, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { exigirUsuario } from '@/lib/auth-servidor';
import { getEventos } from '@/lib/content';
import { MESES, dshort, hojeIso, quando, separarEventos } from '@/lib/datas';
import { db } from '@/lib/db';
import { listarNoticias, type ItemLista } from '@/lib/admin/noticias';
import { listarContatos, FORMULARIOS } from '@/lib/admin/contatos';
import { resumoPainel } from '@/lib/admin/painel';
import { pode } from '@/lib/admin/permissoes';
import { Aviso } from '@/components/admin/Aviso';
import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Visão geral' };

const VER = 'inline-flex items-center gap-1 text-[0.8rem] font-semibold text-primary no-underline hover:underline [&_svg]:size-3.5';

// Estado vazio compacto: diz o que não há e, quando faz sentido, oferece o próximo passo.
function Vazio({ icone, titulo, texto, children }: { icone: React.ReactNode; titulo: string; texto: string; children?: React.ReactNode }) {
  return (<div className="grid justify-items-center gap-1 py-3 text-center [&>svg]:mb-1 [&>svg]:size-6 [&>svg]:text-primary">
    {icone}<p className="font-semibold">{titulo}</p><p className="text-[0.8rem] text-muted-foreground">{texto}</p>{children && <div className="mt-2">{children}</div>}
  </div>);
}

export default async function Page() {
  const u = await exigirUsuario();
  const revisa = pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' });
  const escreve = pode(u, 'noticia.criar'), agenda = pode(u, 'agenda.editar');
  const lista = async (situacao: 'revisao' | 'devolvida', autorId?: string) => { const r = await listarNoticias(db, u, { situacao, autorId }); return r.ok ? r.valor : { itens: [], total: 0 }; };
  let dados;
  try {
    const [resumo, eventos, emRevisao, devolvidas, msgs] = await Promise.all([
      resumoPainel(db, u), getEventos(), revisa ? lista('revisao') : { itens: [], total: 0 },
      escreve ? lista('devolvida', u.id) : { itens: [], total: 0 },
      listarContatos(db, u, {}),
    ]);
    dados = { resumo, prox: separarEventos(eventos, hojeIso()).prox, emRevisao, devolvidas, msgs: msgs.ok ? msgs.valor.itens.slice(0, 6) : null };
  } catch {
    return (<><Cabecalho titulo="Visão geral" /><Aviso tipo="erro">Não foi possível carregar o painel. <a href="/admin">Tentar de novo</a></Aviso></>);
  }
  const { resumo, prox, emRevisao, devolvidas, msgs } = dados;
  const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' });
  const itens = (ns: ItemLista[], comentario = false) => <ul className="lista">{ns.slice(0, 5).map(n => <li key={n.id}><span className="min-w-0"><a href={`/admin/noticias/${n.id}`}>{n.titulo}</a>{comentario && n.comentarioRevisao && <span className="sub">{n.comentarioRevisao}</span>}</span><span className="meta">{n.autor}</span></li>)}</ul>;
  // cada indicador só existe quando o papel pode ver aquilo; o fundo verde-claro marca o que espera por uma ação
  const indicador = (rotulo: string, n: number | undefined, icone: React.ReactNode, href: string, ver: string, espera = false) => n !== undefined && (
    <div className={'grid gap-1 rounded-lg border p-4 shadow-card ' + (espera && n > 0 ? 'border-primary/25 bg-ok-soft' : 'bg-card')}>
      <p className="flex items-start justify-between gap-2 text-muted-foreground [&>svg]:size-5 [&>svg]:flex-none [&>svg]:text-primary">{rotulo}{icone}</p>
      <b className="font-display text-[2rem] leading-none font-extrabold tabular-nums">{n}</b>
      <a href={href} className={VER + ' mt-1 justify-self-start'}>{ver}<ArrowRight aria-hidden="true" /></a>
    </div>);
  const atalho = (href: string, rotulo: string, icone: React.ReactNode, novaAba = false) => (
    <a href={href} {...(novaAba ? { target: '_blank', rel: 'noopener' } : {})} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 font-semibold no-underline shadow-card hover:border-primary/40 hover:bg-secondary [&>svg]:size-[18px] [&>svg]:flex-none [&>svg]:text-primary">
      {icone}{rotulo}{novaAba && <span className="sr-only"> (abre em nova aba)</span>}<ArrowRight aria-hidden="true" className="ml-auto text-muted-foreground!" /></a>);

  return (<>
    <Cabecalho sobre={hoje} titulo="Visão geral" descricao={`Olá, ${u.nome.split(' ')[0]}. Veja o que chegou e o que espera por você.`} extra={<>
      {agenda && <Button asChild variant="outline"><a href="/admin/agenda/novo"><CalendarDays aria-hidden="true" />Novo evento</a></Button>}
      {escreve && <Button asChild><a href="/admin/noticias/nova"><Plus aria-hidden="true" />Nova notícia</a></Button>}
    </>} />
    <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {indicador('Notícias publicadas', resumo.publicadas, <Newspaper aria-hidden="true" />, '/admin/noticias?situacao=publicada', 'Ver notícias')}
      {indicador('Aguardando revisão', resumo.emRevisao, <CircleCheck aria-hidden="true" />, '/admin/noticias?situacao=revisao', 'Ver pendências', true)}
      {agenda && indicador('Eventos futuros', resumo.eventosFuturos, <CalendarDays aria-hidden="true" />, '/admin/agenda', 'Ver agenda')}
      {indicador('Mensagens novas', resumo.mensagensNovas, <Mail aria-hidden="true" />, '/admin/contatos?lida=nao', 'Ver mensagens', true)}
    </div>
    <div className={'grid items-start gap-4 ' + (msgs ? 'xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]' : 'lg:grid-cols-2')}>
      {msgs && <Card role="region" aria-labelledby="h-msg" className="gap-3">
        <CardHeader><CardTitle id="h-msg">Mensagens recentes</CardTitle><a href="/admin/contatos" className={VER}>Ver todas<ArrowRight aria-hidden="true" /></a></CardHeader>
        {msgs.length ? <ul className="-mx-2 divide-y">{msgs.map(c => (
          <li key={c.id}><a href={`/admin/contatos/${c.id}`} className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-2 py-2.5 no-underline hover:bg-secondary sm:grid-cols-[auto_auto_minmax(0,1.2fr)_minmax(0,1fr)_auto_auto]">
            <span className={'size-2 rounded-full ' + (c.lida ? '' : 'bg-primary')}>{!c.lida && <span className="sr-only">Nova: </span>}</span>
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">{c.nome.trim().charAt(0).toUpperCase()}</span>
            <span className={'truncate ' + (c.lida ? 'font-medium' : 'font-bold')}>{c.nome}</span>
            <span className="truncate text-muted-foreground max-sm:col-start-3 max-sm:row-start-2 max-sm:text-[0.8rem]">{FORMULARIOS[c.formulario].titulo}</span>
            <span className="meta max-sm:col-start-4 max-sm:row-start-1">{quando(c.criadaEm)}</span>
            <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground max-sm:hidden" />
          </a></li>))}</ul>
          : <Vazio icone={<Mail aria-hidden="true" />} titulo="Nenhuma mensagem ainda" texto="O que chegar pelos formulários do site aparece aqui." />}
      </Card>}
      <div className={msgs ? 'grid gap-4' : 'contents'}>
        {revisa && <Card role="region" aria-labelledby="h-rev" className="gap-3">
          <CardHeader><CardTitle id="h-rev">Revisão de notícias</CardTitle>{emRevisao.total > 5 && <a href="/admin/noticias?situacao=revisao" className={VER}>Ver todas as {emRevisao.total}<ArrowRight aria-hidden="true" /></a>}</CardHeader>
          {emRevisao.itens.length ? itens(emRevisao.itens)
            : <Vazio icone={<CircleCheck aria-hidden="true" />} titulo="Tudo em dia" texto="Nenhuma notícia aguardando revisão." />}
        </Card>}
        {devolvidas.itens.length > 0 && <Card role="region" aria-labelledby="h-dev" className="gap-3">
          <CardHeader><CardTitle id="h-dev">Devolvidas para você ajustar</CardTitle>{devolvidas.total > 5 && <a href={`/admin/noticias?situacao=devolvida&autor=${u.id}`} className={VER}>Ver todas as {devolvidas.total}<ArrowRight aria-hidden="true" /></a>}</CardHeader>
          {itens(devolvidas.itens, true)}
        </Card>}
        <Card role="region" aria-labelledby="h-ev" className="gap-3">
          <CardHeader><CardTitle id="h-ev">Próximos eventos</CardTitle>{agenda && prox.length > 0 && <a href="/admin/agenda" className={VER}>Ver agenda<ArrowRight aria-hidden="true" /></a>}</CardHeader>
          {prox.length ? <ul className="grid gap-3">{prox.slice(0, 4).map(e => {
            const [, mes, dia] = e.data.split('-');
            return (<li key={e.data + e.titulo} className="flex items-center gap-3">
              <span className="grid size-11 flex-none content-center justify-items-center rounded-md bg-accent leading-none text-accent-foreground" title={dshort(e.data)}>
                <b className="font-display text-base font-extrabold">{Number(dia)}</b>
                <span className="mt-0.5 text-[0.6rem] font-bold tracking-widest uppercase">{MESES[Number(mes) - 1]}</span>
              </span>
              <span className="min-w-0"><span className="block leading-snug font-semibold">{e.titulo}</span><span className="meta">{[e.horario, e.local].filter(Boolean).join(' · ')}</span></span>
            </li>);
          })}</ul>
            : <Vazio icone={<CalendarDays aria-hidden="true" />} titulo="Nenhum evento programado" texto="A agenda do site está sem próximos eventos.">
              {agenda && <Button asChild size="sm"><a href="/admin/agenda/novo"><Plus aria-hidden="true" />Criar evento</a></Button>}</Vazio>}
        </Card>
      </div>
    </div>
    <h2 className="mt-6 mb-3 font-display text-[1.0625rem] font-bold">Acesso rápido</h2>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      {pode(u, 'paginas.editar') && atalho('/admin/paginas', 'Editar páginas', <FileText aria-hidden="true" />)}
      {pode(u, 'diretoria.editar') && atalho('/admin/diretoria', 'Gerenciar diretoria', <Users aria-hidden="true" />)}
      {atalho('/', 'Ver site', <ExternalLink aria-hidden="true" />, true)}
    </div>
  </>);
}
