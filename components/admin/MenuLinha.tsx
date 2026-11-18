'use client';
import { useTransition } from 'react';
import { Ellipsis, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Ico, type IconName } from '@/components/Ico';

export type LinkMenu = { href: string; rotulo: string; icone: IconName; novaAba?: boolean };
export type Apagar = { acao: (f: FormData) => Promise<void>; id: string; nome: string; volta: string };
// Outras ações da linha, enviadas no mesmo formato (acao, ids, volta); `confirma` pede confirmação antes.
export type Acoes = Omit<Apagar, 'nome'> & { itens: { valor: string; rotulo: string; confirma?: string }[] };

// Coluna "Ações" das tabelas: só os três pontos, para ocupar pouco. O menu traz os links, as ações e o apagar
// (com confirmação), enviados pela mesma Server Action da massa.
export function MenuLinha({ nome, links = [], acoes, apagar }: { nome: string; links?: LinkMenu[]; acoes?: Acoes; apagar?: Apagar }) {
  const [enviando, iniciar] = useTransition();
  const envia = (a: Omit<Apagar, 'nome'>, valor: string, confirma?: string) => {
    if (confirma && !confirm(confirma)) return;
    const f = new FormData(); f.set('acao', valor); f.append('ids', a.id); f.set('volta', a.volta);
    iniciar(() => a.acao(f));
  };
  return (<DropdownMenu>
    <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground" disabled={enviando} aria-label={`Mais ações: ${nome}`} title="Mais ações"><Ellipsis aria-hidden="true" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      {links.map(l => <DropdownMenuItem key={l.href} asChild><a href={l.href} {...(l.novaAba ? { target: '_blank', rel: 'noopener' } : {})}><Ico n={l.icone} cls="ico size-4" />{l.rotulo}{l.novaAba && <span className="sr-only"> (abre em nova aba)</span>}</a></DropdownMenuItem>)}
      {acoes?.itens.map(i => <DropdownMenuItem key={i.valor} onSelect={() => envia(acoes, i.valor, i.confirma)}>{i.valor === 'tirar' ? <EyeOff aria-hidden="true" /> : i.valor === 'publicar' && <Eye aria-hidden="true" />}{i.rotulo}</DropdownMenuItem>)}
      {apagar && (links.length > 0 || acoes) && <DropdownMenuSeparator />}
      {apagar && <DropdownMenuItem className="text-destructive data-highlighted:bg-erro-soft" onSelect={() => envia(apagar, 'apagar', `Apagar "${apagar.nome}"? Isso não pode ser desfeito.`)}><Trash2 aria-hidden="true" />Apagar</DropdownMenuItem>}
    </DropdownMenuContent>
  </DropdownMenu>);
}
