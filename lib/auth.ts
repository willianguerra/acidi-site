// Configuração do Better Auth sem nada do Next, para os testes de banco. A instância do app fica em
// lib/auth-servidor.ts (que acrescenta o plugin de cookies do Next).
import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc, userAc } from 'better-auth/plugins/admin/access';
import type { Db } from './db/index.ts';
import * as schema from './db/schema.ts';
import type { Papel, Usuario } from './admin/permissoes.ts';

// Só o papel admin usa os endpoints do plugin; revisor e editor são papéis do nosso pode().
const ac = createAccessControl(defaultStatements);
const roles = { admin: adminAc, revisor: userAc, editor: userAc };

export function criarAuth(db: Db, extras: BetterAuthPlugin[] = []) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 10 },
    rateLimit: { enabled: true },
    user: { additionalFields: { trocarSenha: { type: 'boolean', defaultValue: true, input: false } } },
    plugins: [admin({ ac, roles, defaultRole: 'editor', adminRoles: ['admin'] }), ...extras],
  });
}

export function paraUsuario(u: { id: string; name: string; role?: string | null; banned?: boolean | null }): Usuario {
  const papel: Papel = u.role === 'admin' || u.role === 'revisor' ? u.role : 'editor';
  return { id: u.id, nome: u.name, papel, ativo: !u.banned };
}
