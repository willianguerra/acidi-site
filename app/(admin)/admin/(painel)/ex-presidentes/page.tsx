import { redirect } from 'next/navigation';
import { Expansivel } from '@/components/admin/Expansivel';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { listarExPresidentes } from '@/lib/admin/ex-presidentes';
import { FormExPresidente } from '@/components/admin/FormsDiretoria';
import { Mover } from '@/components/admin/Mover';
import { Ico } from '@/components/Ico';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';
import { moverExPresidente } from '../diretoria/acoes';

export const metadata = { title: 'Ex-presidentes' };

const OKS: Record<string, string> = { salvo: 'Lista atualizada no site.', apagado: 'Removido da lista.' };
const iniciais = (nome: string) => nome.split(' ').filter(Boolean).map(x => x[0]).filter((_, j, a) => j === 0 || j === a.length - 1).join('').toUpperCase();

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const r = await listarExPresidentes(db, await exigirUsuario());
  if (!r.ok) redirect('/admin');
  const ok = (await searchParams).ok, n = r.valor.length;
  return (<>
    <Cabecalho titulo="Ex-presidentes" descricao="Galeria de ex-presidentes do site, na ordem em que aparecem." extra={<Button asChild variant="outline"><a href="/ex-presidentes" target="_blank" rel="noopener"><Ico n="ext" cls="ico size-4" />Ver no site<span className="sr-only"> (abre em nova aba)</span></a></Button>} />
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
    <Expansivel titulo="Adicionar ex-presidente">
      <FormExPresidente p={{ id: null, nome: '', gestao: '', foto: '' }} />
    </Expansivel>
    <Card className="gap-2">
      <CardHeader><CardTitle>Galeria</CardTitle><span className="text-xs text-muted-foreground tabular-nums">{n} {n === 1 ? 'nome' : 'nomes'}</span></CardHeader>
      {n ? <ol className="lista">{r.valor.map((p, i) => (
        <li key={p.id} id={'p-' + p.id}>
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span aria-hidden="true" className="w-5 flex-none text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
            {p.foto ? <img src={p.foto} alt="" loading="lazy" className="size-11 flex-none rounded-full bg-accent object-cover" />
              : <span aria-hidden="true" className="grid size-11 flex-none place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">{iniciais(p.nome)}</span>}
            <span className="min-w-0"><a href={`/admin/ex-presidentes/${p.id}`}>{p.nome}</a><span className="sub">{p.gestao || 'Gestão não informada'}{!p.foto && ' · sem retrato'}</span></span>
          </span>
          <span className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><a href={`/admin/ex-presidentes/${p.id}`} aria-label={`Editar ${p.nome}`}><Ico n="edit" cls="ico size-4" />Editar</a></Button>
            <Mover id={p.id} nome={p.nome} acao={moverExPresidente} primeiro={i === 0} ultimo={i === n - 1} />
          </span>
        </li>))}</ol>
        : <p className="vazio">Nenhum ex-presidente cadastrado.</p>}
    </Card>
  </>);
}
