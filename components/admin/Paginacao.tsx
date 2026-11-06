import { POR_PAGINA, paginasVisiveis, urlCom } from '@/lib/admin/lista';

export function Paginacao({ caminho, params, pagina, total }: { caminho: string; params: Record<string, string | undefined>; pagina: number; total: number }) {
  if (total <= POR_PAGINA) return null;
  const ultima = Math.ceil(total / POR_PAGINA);
  const link = (p: number) => urlCom(caminho, params, { pagina: p === 1 ? undefined : String(p) });
  return (<nav className="paginacao" aria-label="Páginas">
    <span>{(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, total)} de {total}</span>
    <ol>
      {pagina > 1 && <li><a href={link(pagina - 1)} aria-label="Página anterior">‹</a></li>}
      {paginasVisiveis(pagina, ultima).map((p, i) => <li key={i}>{p === '…' ? <span className="pulo" aria-hidden="true">…</span>
        : p === pagina ? <span aria-current="page">{p}</span> : <a href={link(p)} aria-label={`Página ${p}`}>{p}</a>}</li>)}
      {pagina < ultima && <li><a href={link(pagina + 1)} aria-label="Próxima página">›</a></li>}
    </ol>
  </nav>);
}
