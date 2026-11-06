'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Ico } from '@/components/Ico';

// Abaixo de 900px a lateral vira gaveta; acima disso o botão some (CSS) e a lateral fica fixa.
export function Gaveta({ children }: { children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const lateral = useRef<HTMLElement>(null);
  const caminho = usePathname();

  useEffect(() => { setAberta(false); }, [caminho]);

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
    <div className="topo-movel">
      <a className="marca" href="/admin"><img src="/assets/img/logo.png" width="113" height="30" alt="ACIDI admin, início" /></a>
      <button ref={botao} type="button" className="abrir-menu" aria-expanded={aberta} aria-controls="lateral" onClick={() => setAberta(true)}>
        <Ico n="menu" /><span className="sr">Abrir menu</span>
      </button>
    </div>
    <aside ref={lateral} id="lateral" className="barra" data-aberta={aberta || undefined}>
      <button type="button" className="fechar-menu" onClick={fechar}><Ico n="x" /><span className="sr">Fechar menu</span></button>
      {children}
    </aside>
    {aberta && <div className="veu" onClick={fechar} aria-hidden="true" />}
  </>);
}
