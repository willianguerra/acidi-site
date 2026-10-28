import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

export function criarDb(url: string) {
  return drizzle(postgres(url), { schema, casing: 'snake_case' });
}
export type Db = ReturnType<typeof criarDb>;

// Uma conexão por processo; no dev o hot reload reavalia o módulo, então guardamos no globalThis.
const g = globalThis as { __acidiDb?: Db };
export const db: Db = g.__acidiDb ??= criarDb(process.env.DATABASE_URL ?? 'postgres://localhost/sem-database-url');
