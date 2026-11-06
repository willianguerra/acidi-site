'use client';
import { useEffect } from 'react';

const PERGUNTA = 'Há alterações não salvas. Sair mesmo assim?';

// Avisa antes de sair de um formulário alterado; enviar o próprio formulário não conta como sair.
export function AvisoSaida({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    let alterado = false;
    const marcar = () => { alterado = true; };
    const enviou = () => { alterado = false; };
    const antes = (e: BeforeUnloadEvent) => { if (alterado) { e.preventDefault(); e.returnValue = ''; } };
    const clique = (e: MouseEvent) => {
      if (!alterado || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.origin !== location.origin || a.href.split('#')[0] === location.href.split('#')[0]) return;
      if (!confirm(PERGUNTA)) e.preventDefault(); else alterado = false;
    };
    form.addEventListener('input', marcar); form.addEventListener('change', marcar); form.addEventListener('submit', enviou);
    window.addEventListener('beforeunload', antes); document.addEventListener('click', clique, true);
    return () => {
      form.removeEventListener('input', marcar); form.removeEventListener('change', marcar); form.removeEventListener('submit', enviou);
      window.removeEventListener('beforeunload', antes); document.removeEventListener('click', clique, true);
    };
  }, [formId]);
  return null;
}
