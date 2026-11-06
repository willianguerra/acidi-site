import { Ico } from '@/components/Ico';

type Migalha = { href?: string; rotulo: string };

export function Cabecalho({ migalhas, titulo, acao, extra }: { migalhas: Migalha[]; titulo: string; acao?: { href: string; rotulo: string }; extra?: React.ReactNode }) {
  return (<header className="cabecalho">
    <div>
      <nav aria-label="Você está em"><ol className="migalhas">{migalhas.map((m, i) => <li key={i}>{m.href ? <a href={m.href}>{m.rotulo}</a> : <span aria-current="page">{m.rotulo}</span>}</li>)}</ol></nav>
      <h1>{titulo}</h1>
    </div>
    {(acao || extra) && <div className="acoes">{extra}{acao && <a className="bt" href={acao.href}><Ico n="plus" />{acao.rotulo}</a>}</div>}
  </header>);
}
