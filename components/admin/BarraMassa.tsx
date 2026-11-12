'use client';
import { useEffect, useRef, useState } from 'react';

type AcaoMassa = { valor: string; rotulo: string; perigo?: boolean };

// Os checkboxes da Tabela usam form="massa": ficam na tabela, mas são enviados por este form.
// Com JS, a barra só aparece quando há seleção e flutua no pé da tela (regra .massa em admin.css).
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
    // conta no DOM, não no estado: o estado pode não ter sido atualizado ainda
    const n = document.querySelectorAll('input[name="ids"][form="massa"]:checked').length;
    if (!n) { e.preventDefault(); setFalta(true); return; }
    if (botao?.dataset.perigo && !confirm(`${botao.textContent} ${n} ${nome}? Isso não pode ser desfeito.`)) e.preventDefault();
  };

  return (<form id="massa" ref={form} action={acao} onSubmit={enviar} data-vazia={qtd ? undefined : true} aria-label={`Ações em massa: ${nome}`}
    className="massa group mx-5 my-3 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-sidebar px-3.5 py-2 text-sm text-white data-vazia:border data-vazia:border-dashed data-vazia:border-input data-vazia:bg-card data-vazia:text-muted-foreground">
    <input type="hidden" name="volta" value={volta} />
    <span className="mr-auto font-semibold" aria-live="polite">{qtd ? `${qtd} selecionada${qtd > 1 ? 's' : ''}` : 'Nenhuma selecionada'}</span>
    {acoes.map(a => <button key={a.valor} type="submit" name="acao" value={a.valor} data-perigo={a.perigo || undefined}
      className={'h-8 cursor-pointer rounded-lg border border-current px-3 text-[0.82rem] font-semibold hover:bg-white/10 group-data-vazia:hover:bg-secondary '
        + (a.perigo ? 'text-[#F7B4AE] group-data-vazia:text-destructive' : 'text-amarelo group-data-vazia:text-primary')}>{a.rotulo}</button>)}
    {falta && <p className="basis-full text-amarelo group-data-vazia:text-destructive" role="alert">Selecione ao menos um item.</p>}
  </form>);
}
