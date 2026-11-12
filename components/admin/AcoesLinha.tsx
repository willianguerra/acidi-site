import { Button } from '@/components/ui/button';
import { Ico } from '@/components/Ico';
import { MenuLinha, type Apagar, type LinkMenu } from './MenuLinha';

type Link = LinkMenu & { onde?: 'texto' | 'icone' | 'menu' };

// Ações de cada linha: a principal por extenso, as de consulta em ícone e o resto (apagar inclusive) no menu "mais ações".
export function AcoesLinha({ nome, links, apagar }: { nome: string; links: Link[]; apagar?: Apagar }) {
  const noMenu = links.filter(l => l.onde === 'menu');
  return (<div className="inline-flex items-center justify-end gap-0.5">
    {links.filter(l => l.onde !== 'menu').map(l => l.onde === 'texto'
      ? <Button key={l.href} asChild variant="ghost" size="sm"><a href={l.href} aria-label={`${l.rotulo} ${nome}`}><Ico n={l.icone} cls="ico size-4" />{l.rotulo}</a></Button>
      : <Button key={l.href} asChild variant="ghost" size="icon-sm" className="text-muted-foreground"><a href={l.href} title={l.rotulo} {...(l.novaAba ? { target: '_blank', rel: 'noopener' } : {})}>
        <Ico n={l.icone} cls="ico size-4" /><span className="sr-only">{l.rotulo}{l.novaAba ? ' (abre em nova aba)' : ''}</span></a></Button>)}
    {(apagar || noMenu.length > 0) && <MenuLinha nome={nome} links={noMenu.map(({ onde: _, ...l }) => l)} apagar={apagar} />}
  </div>);
}
