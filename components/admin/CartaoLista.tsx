import { Card, CardTitle } from '@/components/ui/card';

// Cartão das listas: abas (ou título com a contagem), linha de filtros e, dentro, a barra em massa, a tabela e a paginação.
export function CartaoLista({ titulo, total, abas, filtros, nota, children }: { titulo: string; total?: number; abas?: React.ReactNode; filtros?: React.ReactNode; nota?: React.ReactNode; children: React.ReactNode }) {
  return (<Card role="region" aria-label={titulo} className="mb-5 gap-0 overflow-hidden p-0">
    {abas ? <div className="border-b px-3">{abas}</div>
      : <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3.5">
        <CardTitle>{titulo}</CardTitle>
        {total !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{total} {total === 1 ? 'registro' : 'registros'}</span>}
        {nota && <p className="basis-full text-[0.8rem] text-muted-foreground">{nota}</p>}
      </header>}
    {filtros}
    {children}
  </Card>);
}
