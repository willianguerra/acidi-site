// Tabela padrão das listas. Com `selecionavel`, cada linha ganha um checkbox ligado ao form da BarraMassa.
export type Coluna<T> = { titulo: string; classe?: string; celula: (l: T) => React.ReactNode };

export function Tabela<T>({ colunas, linhas, chave, rotulo, selecionavel, vazio }: { colunas: Coluna<T>[]; linhas: T[]; chave: (l: T) => string; rotulo: (l: T) => string; selecionavel?: boolean; vazio: React.ReactNode }) {
  if (!linhas.length) return <div className="cartao">{vazio}</div>;
  return (<div className="tabela-envolta"><table className="tabela">
    <thead><tr>
      {selecionavel && <th className="sel"><input type="checkbox" data-todas aria-label="Selecionar todas desta página" /></th>}
      {colunas.map(c => <th key={c.titulo} className={c.classe} scope="col">{c.titulo}</th>)}
    </tr></thead>
    <tbody>{linhas.map(l => <tr key={chave(l)}>
      {selecionavel && <td className="sel"><input type="checkbox" name="ids" value={chave(l)} form="massa" aria-label={`Selecionar ${rotulo(l)}`} /></td>}
      {colunas.map(c => <td key={c.titulo} className={c.classe} data-titulo={c.titulo}>{c.celula(l)}</td>)}
    </tr>)}</tbody>
  </table></div>);
}
