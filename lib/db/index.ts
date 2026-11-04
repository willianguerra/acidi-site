import { drizzle } from 'drizzle-orm/mysql2';
import mysql, { type PoolOptions } from 'mysql2/promise';
import * as schema from './schema.ts';

// timezone 'Z': datas gravadas e lidas em UTC. dateStrings só para DATE: colunas date({ mode: 'string' }) chegam como '2026-11-05'.
export function criarDb(conexao: string | PoolOptions) {
  const base = typeof conexao === 'string' ? { uri: conexao } : conexao;
  const pool = mysql.createPool({ ...base, charset: 'utf8mb4_unicode_ci', timezone: 'Z', dateStrings: ['DATE'], connectionLimit: 5 });
  return drizzle(pool, { schema, mode: 'default', casing: 'snake_case' });
}
export type Db = ReturnType<typeof criarDb>;

// Uma conexão por processo; no dev o hot reload reavalia o módulo, então guardamos no globalThis.
// O banco vinculado no painel do cPanel chega em DB_*, e a senha vai separada (sem codificar caracteres especiais).
function conexaoDoAmbiente(): string | PoolOptions {
  const e = process.env;
  if (e.DB_NAME) return { host: e.DB_HOST || 'localhost', port: Number(e.DB_PORT || 3306), database: e.DB_NAME, user: e.DB_USER, password: e.DB_PASSWORD };
  return e.DATABASE_URL ?? 'mysql://localhost/sem-database-url';
}

const g = globalThis as { __acidiDb?: Db };
export const db: Db = g.__acidiDb ??= criarDb(conexaoDoAmbiente());
