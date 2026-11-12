import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Título da página, descrição e ação principal. As migalhas ficam no topo (components/admin/Migalhas.tsx).
export function Cabecalho({ titulo, descricao, acao, extra, sobre }: { titulo: string; descricao?: string; acao?: { href: string; rotulo: string }; extra?: React.ReactNode; sobre?: string }) {
  return (<header className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
    <div className="min-w-0">
      {sobre && <p className="mb-1 text-[0.8rem] text-muted-foreground first-letter:uppercase">{sobre}</p>}
      <h1>{titulo}</h1>
      {descricao && <p className="mt-1 text-muted-foreground">{descricao}</p>}
    </div>
    {(acao || extra) && <div className="flex flex-wrap items-center gap-2">{extra}{acao && <Button asChild><a href={acao.href}><Plus aria-hidden="true" />{acao.rotulo}</a></Button>}</div>}
  </header>);
}
