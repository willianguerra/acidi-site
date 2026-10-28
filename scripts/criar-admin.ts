// Cria a primeira conta de admin (sem troca de senha obrigatória).
// Uso: npm run criar-admin -- --nome "Maria Silva" --email maria@acidi.net --senha "senha-com-10+"
import { parseArgs } from 'node:util';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db/index.ts';
import { user } from '../lib/db/schema.ts';
import { criarAuth } from '../lib/auth.ts';

const { values: a } = parseArgs({ options: { nome: { type: 'string' }, email: { type: 'string' }, senha: { type: 'string' } } });
if (!a.nome || !a.email || !a.senha) {
  console.error('Uso: npm run criar-admin -- --nome "Nome" --email e-mail --senha "senha com 10 ou mais caracteres"');
  process.exit(1);
}
try {
  const r = await criarAuth(db).api.createUser({ body: { name: a.nome, email: a.email, password: a.senha, role: 'admin' } });
  await db.update(user).set({ trocarSenha: false }).where(eq(user.id, r.user.id));
  console.log(`Admin criado: ${a.email}`);
} catch (e) {
  console.error('Não foi possível criar o admin:', (e as Error).message);
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
