'use client';
// Form GET dos filtros: trocar um select já filtra; o botão fica para quem navega pelo teclado ou sem JS.
export function Filtros({ acao, children }: { acao: string; children: React.ReactNode }) {
  return (<form className="filtros" role="search" action={acao} onChange={e => { if ((e.target as HTMLElement).tagName === 'SELECT') e.currentTarget.requestSubmit(); }}>
    {children}
    <button className="bt sec peq" type="submit">Filtrar</button>
  </form>);
}
