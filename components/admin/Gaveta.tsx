'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Ico } from '@/components/Ico';

const BOTAO = 'grid size-9 flex-none cursor-pointer place-items-center rounded-lg border';

// Topo (migalhas, site e conta) + lateral. Abaixo de 1024px a lateral vira gaveta; acima disso o botão some (CSS).
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
    <header className="topo sticky top-0 z-20 flex h-(--topo) items-center gap-3 border-b bg-card px-4 lg:col-start-2 lg:row-start-1 lg:px-8">
      <button ref={botao} type="button" className={'abrir-menu hover:bg-secondary lg:hidden ' + BOTAO} aria-expanded={aberta} aria-controls="lateral" onClick={() => setAberta(true)}>
        <Ico n="menu" /><span className="sr-only">Abrir menu</span>
      </button>
      {topo}
    </header>
    <aside ref={lateral} id="lateral" data-aberta={aberta || undefined}
      className="barra invisible fixed inset-y-0 left-0 z-40 flex w-[min(280px,86vw)] -translate-x-full flex-col gap-5 overflow-y-auto bg-sidebar px-3 pt-5 pb-6 text-sidebar-foreground transition-transform duration-200 data-aberta:visible data-aberta:translate-x-0 lg:visible lg:sticky lg:top-0 lg:z-auto lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-svh lg:w-auto lg:translate-x-0">
      <button type="button" className={'absolute top-3 right-3 border-white/25 text-white hover:bg-white/10 lg:hidden ' + BOTAO} onClick={fechar}><Ico n="x" /><span className="sr-only">Fechar menu</span></button>
      {children}
    </aside>
    {aberta && <div className="fixed inset-0 z-30 bg-mata/55 lg:hidden" onClick={fechar} aria-hidden="true" />}
  </>);
}
