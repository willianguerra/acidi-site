'use client';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Seção recolhível de formulário (<details>): os campos continuam no envio mesmo fechada.
// Se o servidor devolver erro em algum campo daqui, ela abre sozinha (o foco é levado pelo AvisoSaida).
export function Secao({ icone, titulo, resumo, aberta, erro, children }: { icone: React.ReactNode; titulo: string; resumo: string; aberta?: boolean; erro?: boolean; children: React.ReactNode }) {
  const [abre, setAbre] = useState(!!aberta || !!erro);
  useEffect(() => { if (erro) setAbre(true); }, [erro]);
  return (<details className="group rounded-lg border" open={abre} onToggle={e => setAbre(e.currentTarget.open)}>
    <summary className="flex list-none items-center gap-3 rounded-lg px-4 py-3 hover:bg-secondary [&::-webkit-details-marker]:hidden [&>svg]:size-[18px] [&>svg]:flex-none [&>svg]:text-primary">
      {icone}
      <span className="font-display text-[0.95rem] font-bold">{titulo}</span>
      <span className="min-w-0 truncate border-l pl-3 text-[0.8rem] text-muted-foreground max-sm:hidden">{resumo}</span>
      <ChevronDown aria-hidden="true" className="ml-auto text-muted-foreground! transition-transform group-open:rotate-180" />
    </summary>
    <div className="grid gap-4 border-t px-4 py-4">{children}</div>
  </details>);
}
