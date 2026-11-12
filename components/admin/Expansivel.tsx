import { ChevronDown, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Formulário de "adicionar" recolhido no topo das listas. <details> nativo: abre sem JS.
export function Expansivel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (<Card className="mb-4 p-0">
    <details className="group">
      <summary className="flex list-none items-center gap-2.5 rounded-lg px-5 py-3 font-semibold hover:bg-secondary [&::-webkit-details-marker]:hidden">
        <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground"><Plus aria-hidden="true" className="size-4" /></span>
        {titulo}
        <ChevronDown aria-hidden="true" className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t px-5 py-5">{children}</div>
    </details>
  </Card>);
}
