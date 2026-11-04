// Utilitários dos testes *.db-test.ts: banco de TEST_DATABASE_URL, migrado e esvaziado entre testes.
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/mysql2/migrator';
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
  const [linhas] = await db.execute(sql`select table_name as t from information_schema.tables where table_schema = database() and table_name <> '__drizzle_migrations'`);
  const nomes = (linhas as unknown as { t: string }[]).map(l => l.t);
  // uma conexão só: o SET vale para a sessão, e o pool poderia dar outra conexão a cada execute
  await db.transaction(async tx => {
    await tx.execute(sql`set foreign_key_checks = 0`);
    for (const n of nomes) await tx.execute(sql.raw('truncate table `' + n + '`'));
    await tx.execute(sql`set foreign_key_checks = 1`);
  });
}

export async function fechar(db: Db): Promise<void> {
  await db.$client.end();
}
