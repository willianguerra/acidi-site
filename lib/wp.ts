// Conversão do HTML dos posts do WordPress antigo para os blocos do editor de notícias.
// Os posts usam só <p>, <ul>/<ol>, <blockquote> e formatação inline; a formatação inline vira texto puro.
import type { Bloco } from './types.ts';

const NOMEADAS: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', ordm: 'º', ordf: 'ª' };

export const textoDe = (html: string) => html
  .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => NOMEADAS[n.toLowerCase()] ?? m)
  .replace(/\s+/g, ' ').trim();

export function blocosDe(html: string): Bloco[] {
  const blocos: Bloco[] = [];
  for (const [, tag, dentro] of html.matchAll(/<(p|ul|ol|blockquote|h[2-6])[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = tag.toLowerCase();
    if (t === 'ul' || t === 'ol') {
      const itens = [...dentro.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => textoDe(m[1])).filter(Boolean);
      if (itens.length) blocos.push({ lista: itens });
    } else {
      const texto = textoDe(dentro);
      if (texto) blocos.push(t === 'blockquote' ? { citacao: texto } : texto);
    }
  }
  return blocos;
}

// Resumo para a lista e o Google: a primeira frase completa que caiba em ~200 caracteres.
export function resumoDe(texto: string, max = 200): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const frase = corte.lastIndexOf('. ');
  return frase > 80 ? corte.slice(0, frase + 1) : corte.slice(0, corte.lastIndexOf(' ')) + '…';
}
