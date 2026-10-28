// Utilitários dos testes *.db-test.ts: banco de TEST_DATABASE_URL, migrado e esvaziado entre testes.
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { criarDb, type Db } from './index.ts';
export type { Db };

export async function dbDeTeste(): Promise<Db> {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL não definida (veja .env.example)');
  const db = criarDb(url);
  await migrate(db, { migrationsFolder: 'drizzle' });
  return db;
}

export async function limpar(db: Db): Promise<void> {
  const r = await db.execute<{ tablename: string }>(sql`select tablename from pg_tables where schemaname = 'public'`);
  const nomes = r.map(t => `"${t.tablename}"`).join(', ');
  if (nomes) await db.execute(sql.raw(`truncate ${nomes} restart identity cascade`));
}

export async function fechar(db: Db): Promise<void> {
  await db.$client.end();
}
