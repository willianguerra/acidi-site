import { Ico, type IconName } from '@/components/Ico';
import { BotaoApagar } from './BotaoApagar';

type Link = { href: string; rotulo: string; icone: IconName; novaAba?: boolean };

// Ações fixas à direita de cada linha. `apagar` usa a Server Action de massa com um único id.
export function AcoesLinha({ links, apagar }: { links: Link[]; apagar?: { acao: (f: FormData) => Promise<void>; id: string; nome: string; volta: string } }) {
  return (<div className="acoes-icones">
    {links.map(l => <a key={l.href} className="icone" href={l.href} title={l.rotulo} {...(l.novaAba ? { target: '_blank', rel: 'noopener' } : {})}>
      <Ico n={l.icone} /><span className="sr">{l.rotulo}{l.novaAba ? ' (abre em nova aba)' : ''}</span></a>)}
    {apagar && <form action={apagar.acao}>
      <input type="hidden" name="ids" value={apagar.id} /><input type="hidden" name="volta" value={apagar.volta} />
      <BotaoApagar nome={apagar.nome} />
    </form>}
  </div>);
}
