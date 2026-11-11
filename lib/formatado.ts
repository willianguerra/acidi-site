export type Parte = string | { b: string } | { a: string; href: string };

// "/x" sim, "//x" (mesmo esquema, outro site) não
export const linkSeguro = (href: string): boolean => /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(href);

export function partes(s: string): Parte[] {
  const out: Parte[] = [];
  let ini = 0;
  const junta = (t: string) => {
    if (!t) return;
    if (typeof out[out.length - 1] === 'string') out[out.length - 1] += t;
    else out.push(t);
  };
  for (const m of s.matchAll(/\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    junta(s.slice(ini, m.index));
    ini = m.index + m[0].length;
    if (m[1] !== undefined) out.push({ b: m[1] });
    else if (linkSeguro(m[3])) out.push({ a: m[2], href: m[3] });
    else junta(m[0]);
  }
  junta(s.slice(ini));
  return out;
}
