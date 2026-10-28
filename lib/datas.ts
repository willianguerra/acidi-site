import type { Evento } from './types.ts';

export const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_EXT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function dlong(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${+d} de ${MESES_EXT[+m - 1]} de ${y}`;
}

export function dshort(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${+d} ${MESES[+m - 1]} ${y}`;
}

// Mesmo id do gerador antigo: links como /agenda#evento-2022-05-18-do-dnitsc dependem dele.
export function evId(e: Evento): string {
  const ascii = e.titulo.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  return 'evento-' + e.data + '-' + ascii.split(/\s+/).slice(-2).map(w => w.replace(/[^a-z0-9]/g, '')).join('-');
}

// Data local AAAA-MM-DD (igual a isoLocal do site.js)
export function hojeIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
