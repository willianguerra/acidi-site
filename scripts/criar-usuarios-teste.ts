// Cria uma conta de teste por papel (admin, revisor, editor), sem troca de senha obrigatória.
// Uso: npm run criar-usuarios-teste
// As senhas são fixas e públicas (mesmo padrão do testes/admin.py), por isso só roda em banco local.
import { eq } from 'drizzle-orm';
import { db } from '../lib/db/index.ts';
import { user } from '../lib/db/schema.ts';
import { criarAuth } from '../lib/auth.ts';

const PAPEIS = ['admin', 'revisor', 'editor'] as const;
const conta = (papel: string) => ({ nome: papel[0].toUpperCase() + papel.slice(1) + ' Teste', email: `${papel}@acidi.test`, senha: `${papel}-local-123` });

// mesmo critério de lib/db/index.ts: DB_* tem preferência sobre DATABASE_URL
const host = process.env.DB_NAME ? process.env.DB_HOST || 'localhost' : URL.parse(process.env.DATABASE_URL ?? '')?.hostname ?? '';
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
  console.error(`Recusado: o banco em "${host}" não é local. Contas de teste têm senha conhecida.`);
  process.exit(1);
}

try {
  const auth = criarAuth(db);
  for (const papel of PAPEIS) {
    const c = conta(papel);
    const [existe] = await db.select({ id: user.id }).from(user).where(eq(user.email, c.email));
    if (existe) { console.log(`Já existe:  ${c.email}`); continue; }
    const r = await auth.api.createUser({ body: { name: c.nome, email: c.email, password: c.senha, role: papel as 'admin' } });
    await db.update(user).set({ trocarSenha: false }).where(eq(user.id, r.user.id));
    console.log(`Criado:     ${c.email}  (senha: ${papel}-local-123)`);
  }
} catch (e) {
  console.error('Não foi possível criar as contas de teste:', (e as Error).message);
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
