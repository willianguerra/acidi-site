// Cartão das listas: título com a contagem, filtros à direita e, dentro, a barra em massa, a tabela e a paginação.
export function CartaoLista({ titulo, total, filtros, children }: { titulo: string; total: number; filtros?: React.ReactNode; children: React.ReactNode }) {
  return (<section className="cartao-lista" aria-label={titulo}>
    <header className="cartao-lista-topo">
      <h2>{titulo} <span className="registros">{total} {total === 1 ? 'registro' : 'registros'}</span></h2>
      {filtros}
    </header>
    {children}
  </section>);
}
