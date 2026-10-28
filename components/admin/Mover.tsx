// Botões de subir/descer um item numa lista ordenada (formulários simples, funcionam sem JS).
export function Mover({ id, nome, acao, primeiro, ultimo }: { id: string; nome: string; acao: (f: FormData) => Promise<void>; primeiro: boolean; ultimo: boolean }) {
  return (
    <span className="acoes">
      <form action={acao}><input type="hidden" name="id" value={id} /><input type="hidden" name="direcao" value="cima" />
        <button className="bt sec peq" disabled={primeiro} aria-label={`Subir ${nome}`}>↑</button></form>
      <form action={acao}><input type="hidden" name="id" value={id} /><input type="hidden" name="direcao" value="baixo" />
        <button className="bt sec peq" disabled={ultimo} aria-label={`Descer ${nome}`}>↓</button></form>
    </span>
  );
}
