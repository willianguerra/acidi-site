'use client';
import { useTransition } from 'react';
import { Ellipsis, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Ico, type IconName } from '@/components/Ico';

export type LinkMenu = { href: string; rotulo: string; icone: IconName; novaAba?: boolean };
export type Apagar = { acao: (f: FormData) => Promise<void>; id: string; nome: string; volta: string };

// Menu "mais ações" de uma linha: links secundários e apagar (com confirmação), pela mesma Server Action da massa.
export function MenuLinha({ nome, links = [], apagar }: { nome: string; links?: LinkMenu[]; apagar?: Apagar }) {
  const [enviando, iniciar] = useTransition();
  const apaga = () => {
    if (!apagar || !confirm(`Apagar "${apagar.nome}"? Isso não pode ser desfeito.`)) return;
    const f = new FormData(); f.set('acao', 'apagar'); f.append('ids', apagar.id); f.set('volta', apagar.volta);
    iniciar(() => apagar.acao(f));
  };
  return (<DropdownMenu>
    <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground" disabled={enviando} aria-label={`Mais ações: ${nome}`} title="Mais ações"><Ellipsis aria-hidden="true" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      {links.map(l => <DropdownMenuItem key={l.href} asChild><a href={l.href} {...(l.novaAba ? { target: '_blank', rel: 'noopener' } : {})}><Ico n={l.icone} cls="ico size-4" />{l.rotulo}{l.novaAba && <span className="sr-only"> (abre em nova aba)</span>}</a></DropdownMenuItem>)}
      {apagar && links.length > 0 && <DropdownMenuSeparator />}
      {apagar && <DropdownMenuItem className="text-destructive data-highlighted:bg-erro-soft" onSelect={apaga}><Trash2 aria-hidden="true" />Apagar</DropdownMenuItem>}
    </DropdownMenuContent>
  </DropdownMenu>);
}
