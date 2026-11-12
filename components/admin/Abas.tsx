// Abas de filtro das listas: são links, então funcionam sem JS e mantêm os outros filtros no endereço.
export type Aba = { href: string; rotulo: string; n?: number; atual: boolean };

export function Abas({ rotulo, itens }: { rotulo: string; itens: Aba[] }) {
  return (<nav aria-label={rotulo} className="abas -mb-px flex gap-1 overflow-x-auto">
    {itens.map(a => <a key={a.href} href={a.href} aria-current={a.atual ? 'true' : undefined}
      className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-3 font-medium whitespace-nowrap text-muted-foreground hover:text-foreground aria-[current]:border-primary aria-[current]:font-semibold aria-[current]:text-accent-foreground">
      {a.rotulo}{a.n !== undefined && <span className="tabular-nums opacity-80">{a.n}</span>}</a>)}
  </nav>);
}
