import { urlCom } from '@/lib/admin/lista';

type Aba = { valor?: string; rotulo: string; total: number };

export function Abas({ caminho, params, chave, abas, rotulo }: { caminho: string; params: Record<string, string | undefined>; chave: string; abas: Aba[]; rotulo: string }) {
  return (<nav className="abas" aria-label={rotulo}>
    {abas.map(a => <a key={a.valor ?? ''} href={urlCom(caminho, params, { [chave]: a.valor })} aria-current={(params[chave] || undefined) === a.valor ? 'page' : undefined}>
      {a.rotulo}<span className="n">{a.total}</span>
    </a>)}
  </nav>);
}
