export function destaque<T>(lista: T[]): { primeiro: T; resto: T[] } | null {
  return lista.length ? { primeiro: lista[0], resto: lista.slice(1) } : null;
}
