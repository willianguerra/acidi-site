import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { POR_PAGINA, paginasVisiveis, urlCom } from '@/lib/admin/lista';

const NUM = 'min-w-8 px-2 font-medium tabular-nums';

// `nome` é o plural do que está na lista ("notícias"); a contagem aparece mesmo quando cabe tudo numa página.
export function Paginacao({ caminho, params, pagina, total, nome = 'registros' }: { caminho: string; params: Record<string, string | undefined>; pagina: number; total: number; nome?: string }) {
  if (!total) return null;
  const ultima = Math.ceil(total / POR_PAGINA);
  const link = (p: number) => urlCom(caminho, params, { pagina: p === 1 ? undefined : String(p) });
  return (<nav className="paginacao flex min-h-13 flex-wrap items-center justify-between gap-3 border-t px-5 py-2 text-[0.8rem] text-muted-foreground" aria-label="Páginas">
    <span className="tabular-nums">Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, total)} de {total} {nome}</span>
    {ultima > 1 && <ol className="flex gap-1">
      {pagina > 1 && <li><Button asChild variant="ghost" size="icon-sm"><a href={link(pagina - 1)} aria-label="Página anterior"><ChevronLeft aria-hidden="true" /></a></Button></li>}
      {paginasVisiveis(pagina, ultima).map((p, i) => <li key={i}>{p === '…' ? <span className="grid h-8 min-w-8 place-items-center" aria-hidden="true">…</span>
        : p === pagina ? <span aria-current="page" className="grid h-8 min-w-8 place-items-center rounded-lg bg-primary px-2 font-semibold text-primary-foreground tabular-nums">{p}</span>
        : <Button asChild variant="ghost" size="icon-sm" className={NUM}><a href={link(p)} aria-label={`Página ${p}`}>{p}</a></Button>}</li>)}
      {pagina < ultima && <li><Button asChild variant="ghost" size="icon-sm"><a href={link(pagina + 1)} aria-label="Próxima página"><ChevronRight aria-hidden="true" /></a></Button></li>}
    </ol>}
  </nav>);
}
