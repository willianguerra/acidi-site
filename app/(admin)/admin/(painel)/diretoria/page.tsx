import { redirect } from 'next/navigation';
import { Expansivel } from '@/components/admin/Expansivel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarMembros, GRUPOS } from '@/lib/admin/diretoria';
import { FormMembro } from '@/components/admin/FormsDiretoria';
import { Mover } from '@/components/admin/Mover';
import { Ico } from '@/components/Ico';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';
import { moverMembro } from './acoes';

export const metadata = { title: 'Diretoria' };

const OKS: Record<string, string> = { salvo: 'Diretoria atualizada no site.', apagado: 'Membro removido.' };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const r = await listarMembros(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok;
  return (<>
    <Cabecalho titulo="Diretoria" descricao="Membros mostrados na página Diretoria do site, na ordem de cada grupo." extra={<Button asChild variant="outline"><a href="/diretoria" target="_blank" rel="noopener"><Ico n="ext" cls="ico size-4" />Ver no site<span className="sr-only"> (abre em nova aba)</span></a></Button>} />
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
    <Expansivel titulo="Adicionar membro">
      <FormMembro m={{ id: null, grupo: 'executiva', rotulo: '', nome: '', suplente: false }} grupos={GRUPOS} />
    </Expansivel>
    <div className="grid items-start gap-4 xl:grid-cols-2">
      {Object.entries(GRUPOS).map(([g, titulo]) => {
        const ms = r.valor.filter(m => m.grupo === g);
        return (
          <Card role="region" className="gap-2" key={g} aria-labelledby={'g-' + g}>
            <CardHeader><CardTitle id={'g-' + g}>{titulo}</CardTitle><span className="text-xs text-muted-foreground tabular-nums">{ms.length} {ms.length === 1 ? 'membro' : 'membros'}</span></CardHeader>
            {ms.length ? <ol className="lista">{ms.map((m, i) => (
              <li key={m.id} id={'m-' + m.id}>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span aria-hidden="true" className="w-5 flex-none text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="min-w-0">
                    {m.rotulo && <span className="block text-[0.7rem] font-bold tracking-wider text-accent-foreground uppercase">{m.rotulo}</span>}
                    <a href={`/admin/diretoria/${m.id}`}>{m.nome}</a>{m.suplente && <> <Badge>Suplente</Badge></>}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm"><a href={`/admin/diretoria/${m.id}`} aria-label={`Editar ${m.nome}`}><Ico n="edit" cls="ico size-4" />Editar</a></Button>
                  <Mover id={m.id} nome={m.nome} acao={moverMembro} primeiro={i === 0} ultimo={i === ms.length - 1} />
                </span>
              </li>))}</ol>
              : <p className="vazio">Ninguém neste grupo.</p>}
          </Card>
        );
      })}
    </div>
  </>);
}
