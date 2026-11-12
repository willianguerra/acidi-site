import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

// Botões de subir/descer um item numa lista ordenada (formulários simples, funcionam sem JS).
export function Mover({ id, nome, acao, primeiro, ultimo }: { id: string; nome: string; acao: (f: FormData) => Promise<void>; primeiro: boolean; ultimo: boolean }) {
  return (
    <span className="inline-flex gap-1.5">
      <form action={acao}><input type="hidden" name="id" value={id} /><input type="hidden" name="direcao" value="cima" />
        <Button variant="outline" size="icon-sm" disabled={primeiro} aria-label={`Subir ${nome}`}><ArrowUp aria-hidden="true" /></Button></form>
      <form action={acao}><input type="hidden" name="id" value={id} /><input type="hidden" name="direcao" value="baixo" />
        <Button variant="outline" size="icon-sm" disabled={ultimo} aria-label={`Descer ${nome}`}><ArrowDown aria-hidden="true" /></Button></form>
    </span>
  );
}
