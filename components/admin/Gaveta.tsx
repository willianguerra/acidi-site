'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Ico } from '@/components/Ico';

// Barra superior + lateral. Abaixo de 900px a lateral vira gaveta; acima disso o botão some (CSS).
// Também fecha o menu do usuário (details.usuario) ao clicar fora ou com Esc.
export function Gaveta({ topo, children }: { topo: React.ReactNode; children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const lateral = useRef<HTMLElement>(null);
  const caminho = usePathname();

  useEffect(() => { setAberta(false); }, [caminho]);

  useEffect(() => {
    const fora = (e: Event) => document.querySelectorAll<HTMLDetailsElement>('details.usuario[open]').forEach(d => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !d.contains(e.target as Node)) d.open = false;
    });
    document.addEventListener('click', fora); document.addEventListener('keydown', fora);
    return () => { document.removeEventListener('click', fora); document.removeEventListener('keydown', fora); };
  }, []);

  useEffect(() => {
    if (!aberta) return;
    const el = lateral.current!;
    const focaveis = () => [...el.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];
    focaveis()[0]?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setAberta(false); botao.current?.focus(); return; }
      if (e.key !== 'Tab') return;
      const f = focaveis(), primeiro = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberta]);

  const fechar = () => { setAberta(false); botao.current?.focus(); };

  return (<>
    <header className="topo">
      <button ref={botao} type="button" className="abrir-menu" aria-expanded={aberta} aria-controls="lateral" onClick={() => setAberta(true)}>
        <Ico n="menu" /><span className="sr">Abrir menu</span>
      </button>
      {topo}
    </header>
    <aside ref={lateral} id="lateral" className="barra" data-aberta={aberta || undefined}>
      <button type="button" className="fechar-menu" onClick={fechar}><Ico n="x" /><span className="sr">Fechar menu</span></button>
      {children}
    </aside>
    {aberta && <div className="veu" onClick={fechar} aria-hidden="true" />}
  </>);
}
