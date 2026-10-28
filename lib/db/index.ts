import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

// prepare: false porque o pooler de transações do Supabase (porta 6543) não suporta prepared statements.
export function criarDb(url: string) {
  return drizzle(postgres(url, { onnotice: () => {}, prepare: false }), { schema, casing: 'snake_case' });
}
export type Db = ReturnType<typeof criarDb>;

// POSTGRES_URL é a variável criada pela integração Supabase da Vercel (pooler de transações).
// Uma conexão por processo; no dev o hot reload reavalia o módulo, então guardamos no globalThis.
const g = globalThis as { __acidiDb?: Db };
export const db: Db = g.__acidiDb ??= criarDb(process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? 'postgres://localhost/sem-database-url');
