'use client';
import { useEffect, useRef, useState } from 'react';

type AcaoMassa = { valor: string; rotulo: string; perigo?: boolean };

// Os checkboxes da Tabela usam form="massa": ficam na tabela, mas são enviados por este form.
export function BarraMassa({ acao, acoes, nome, volta }: { acao: (f: FormData) => Promise<void>; acoes: AcaoMassa[]; nome: string; volta: string }) {
  const [qtd, setQtd] = useState(0);
  const [falta, setFalta] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const caixas = () => [...document.querySelectorAll<HTMLInputElement>('input[name="ids"][form="massa"]')];
    const todas = document.querySelector<HTMLInputElement>('input[data-todas]');
    const contar = () => {
      const c = caixas(), n = c.filter(x => x.checked).length;
      setQtd(n); if (n) setFalta(false);
      if (todas) { todas.checked = n > 0 && n === c.length; todas.indeterminate = n > 0 && n < c.length; }
    };
    const mudou = (e: Event) => {
      if (e.target === todas) caixas().forEach(x => { x.checked = todas!.checked; });
      contar();
    };
    document.addEventListener('change', mudou);
    contar();
    return () => document.removeEventListener('change', mudou);
  }, []);

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    const botao = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!qtd) { e.preventDefault(); setFalta(true); return; }
    if (botao?.dataset.perigo && !confirm(`${botao.textContent} ${qtd} ${nome}? Isso não pode ser desfeito.`)) e.preventDefault();
  };

  return (<form id="massa" ref={form} action={acao} onSubmit={enviar} className="massa" data-vazia={qtd ? undefined : true} aria-label={`Ações em massa: ${nome}`}>
    <input type="hidden" name="volta" value={volta} />
    <span className="qtd" aria-live="polite">{qtd ? `${qtd} selecionada${qtd > 1 ? 's' : ''}` : 'Nenhuma selecionada'}</span>
    {acoes.map(a => <button key={a.valor} type="submit" name="acao" value={a.valor} className={a.perigo ? 'perigo' : undefined} data-perigo={a.perigo || undefined}>{a.rotulo}</button>)}
    {falta && <p className="falta" role="alert">Selecione ao menos um item.</p>}
  </form>);
}
