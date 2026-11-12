import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Tabela padrão das listas. Com `selecionavel`, cada linha ganha um checkbox ligado ao form da BarraMassa.
export type Coluna<T> = { titulo: string; classe?: 'titulo' | 'num' | 'col-acoes'; largura?: string; celula: (l: T) => React.ReactNode };

// As classes titulo/num/col-acoes/sel também são ganchos do CSS de celular (admin.css).
const CELULA = {
  titulo: 'titulo [&_a]:font-semibold [&_a]:text-foreground [&_a]:no-underline [&_a:hover]:text-primary',
  num: 'num whitespace-nowrap text-muted-foreground tabular-nums',
  'col-acoes': 'col-acoes text-right whitespace-nowrap',
};

export function Tabela<T>({ colunas, linhas, chave, rotulo, selecionavel, vazio, classeLinha }: { colunas: Coluna<T>[]; linhas: T[]; chave: (l: T) => string; rotulo: (l: T) => string; selecionavel?: boolean; vazio: React.ReactNode; classeLinha?: (l: T) => string | undefined }) {
  if (!linhas.length) return <div className="p-5">{vazio}</div>;
  return (<Table className={cn('tabela', colunas.some(c => c.largura) && 'md:table-fixed')}>
    <TableHeader><TableRow>
      {selecionavel && <TableHead className="sel w-11"><input type="checkbox" data-todas aria-label="Selecionar todas desta página" className="block" /></TableHead>}
      {colunas.map(c => <TableHead key={c.titulo} className={cn(c.classe === 'col-acoes' && 'text-right', c.largura)} scope="col">{c.titulo}</TableHead>)}
    </TableRow></TableHeader>
    <TableBody>{linhas.map(l => <TableRow key={chave(l)} className={cn('hover:bg-secondary has-[input:checked]:bg-accent/60', classeLinha?.(l))}>
      {selecionavel && <TableCell className="sel w-11"><input type="checkbox" name="ids" value={chave(l)} form="massa" aria-label={`Selecionar ${rotulo(l)}`} className="block" /></TableCell>}
      {colunas.map(c => <TableCell key={c.titulo} className={cn(c.classe && CELULA[c.classe])} data-titulo={c.titulo}>{c.celula(l)}</TableCell>)}
    </TableRow>)}</TableBody>
  </Table>);
}
