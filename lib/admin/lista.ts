// Paginação, filtros na URL e resumo das ações em massa das listas do admin.
import type { Resultado } from './resultado.ts';

export const POR_PAGINA = 20;
export const MAX_MASSA = 100;

export const lerPagina = (v: string | undefined) => (v && /^[1-9]\d*$/.test(v) ? Number(v) : 1);

export const limitarPagina = (pagina: number, total: number) => Math.min(Math.max(1, pagina), Math.max(1, Math.ceil(total / POR_PAGINA)));

export function paginar<T>(itens: T[], pagina: number) {
  const p = limitarPagina(pagina, itens.length);
  return { itens: itens.slice((p - 1) * POR_PAGINA, p * POR_PAGINA), total: itens.length, pagina: p };
}

// Trocar qualquer filtro volta para a primeira página.
export function urlCom(caminho: string, atual: Record<string, string | undefined>, troca: Record<string, string | undefined>) {
  const juntos: Record<string, string | undefined> = { ...atual, ...troca };
  if (!('pagina' in troca)) delete juntos.pagina;
  const q = new URLSearchParams(Object.entries(juntos).filter((e): e is [string, string] => !!e[1])).toString();
  return q ? `${caminho}?${q}` : caminho;
}

export function paginasVisiveis(atual: number, ultima: number): (number | '…')[] {
  const ns = [...new Set([1, atual - 1, atual, atual + 1, ultima])].filter(n => n >= 1 && n <= ultima).sort((a, b) => a - b);
  return ns.flatMap((n, i) => (i > 0 && n - ns[i - 1] > 1 ? ['…' as const, n] : [n]));
}

export function lerIds(f: FormData): string[] | null {
  const ids = [...new Set(f.getAll('ids').map(String))];
  return ids.length > MAX_MASSA ? null : ids;
}

export function resumoMassa(rs: Resultado<unknown>[]) {
  return {
    feitas: rs.filter(r => r.ok).length,
    recusadas: rs.filter(r => !r.ok && r.erro !== 'nao-encontrada').length,
    naoEncontradas: rs.filter(r => !r.ok && r.erro === 'nao-encontrada').length,
  };
}

export function textoMassa(r: ReturnType<typeof resumoMassa>, feito: string) {
  const partes = [`${r.feitas} ${feito}`];
  if (r.recusadas) partes.push(r.recusadas === 1 ? '1 não pôde ser alterada' : `${r.recusadas} não puderam ser alteradas`);
  if (r.naoEncontradas) partes.push(r.naoEncontradas === 1 ? '1 não encontrada' : `${r.naoEncontradas} não encontradas`);
  return partes.join(', ') + '.';
}
