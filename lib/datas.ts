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

// Data AAAA-MM-DD em Brasília: o build pode rodar em UTC (Vercel, CI) e a agenda é de Indaial
export function hojeIso(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
}

// Mesma regra do splitEvents do site.js: próximos em ordem crescente, arquivo em ordem decrescente.
export function separarEventos(eventos: Evento[], hoje: string): { prox: Evento[]; arquivo: Evento[] } {
  return {
    prox: eventos.filter(e => e.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : 1)),
    arquivo: eventos.filter(e => e.data < hoje).sort((a, b) => (a.data > b.data ? -1 : 1)),
  };
}

// Data e hora no fuso de Indaial, para o admin.
export const quando = (d: Date) => d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
