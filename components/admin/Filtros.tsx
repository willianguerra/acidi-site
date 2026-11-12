'use client';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Form GET dos filtros: trocar um select já filtra; o botão fica para a busca, o teclado e quem está sem JS.
// `fixos` são os filtros que vêm das abas e precisam continuar valendo ao filtrar.
export function Filtros({ acao, fixos = {}, children }: { acao: string; fixos?: Record<string, string | undefined>; children: React.ReactNode }) {
  return (<form className="flex flex-wrap gap-2 border-b px-4 py-3 *:min-w-0 *:flex-[1_1_100%] sm:*:flex-[0_1_200px]" role="search" action={acao} onChange={e => { if ((e.target as HTMLElement).tagName === 'SELECT') e.currentTarget.requestSubmit(); }}>
    {Object.entries(fixos).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
    {children}
    <Button variant="outline" type="submit" className="sm:flex-none!">Filtrar</Button>
  </form>);
}

export function Busca({ rotulo, valor }: { rotulo: string; valor?: string }) {
  return (<div className="relative sm:flex-[1_1_260px]!">
    <label className="sr-only" htmlFor="busca">{rotulo}</label>
    <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input type="search" id="busca" name="busca" placeholder={rotulo + '…'} defaultValue={valor ?? ''} className="pl-9" />
  </div>);
}
