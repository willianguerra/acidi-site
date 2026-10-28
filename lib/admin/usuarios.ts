// Gestão de usuários (só admin). "Papel" e "ativo" são o role e o !banned do plugin admin do Better Auth;
// as mudanças vão direto no banco para não depender de uma sessão HTTP do admin.
import { and, asc, eq, ne, sql } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { user, session } from '../db/schema.ts';
import type { criarAuth } from '../auth.ts';
import { pode, type Papel, type Usuario } from './permissoes.ts';
import { esquemaSenha, esquemaUsuario, validar } from './validacao.ts';
import { ok, falha, type Resultado } from './resultado.ts';

type Auth = ReturnType<typeof criarAuth>;
export type LinhaUsuario = { id: string; nome: string; email: string; papel: Papel; ativo: boolean; trocarSenha: boolean };

const SEM_ADMIN = 'Precisa haver ao menos um admin ativo.';
const papelDe = (r: string | null): Papel => (r === 'admin' || r === 'revisor' ? r : 'editor');

async function outrosAdminsAtivos(db: Db, id: string): Promise<number> {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(user)
    .where(and(eq(user.role, 'admin'), sql`coalesce(${user.banned}, false) = false`, ne(user.id, id)));
  return n;
}

async function alvo(db: Db, u: Usuario, id: string): Promise<Resultado<typeof user.$inferSelect>> {
  if (!pode(u, 'usuarios.gerir')) return falha('sem-permissao');
  const [x] = await db.select().from(user).where(eq(user.id, id));
  return x ? ok(x) : falha('nao-encontrada');
}

export async function listarUsuarios(db: Db, u: Usuario): Promise<Resultado<LinhaUsuario[]>> {
  if (!pode(u, 'usuarios.gerir')) return falha('sem-permissao');
  const l = await db.select().from(user).orderBy(asc(user.name));
  return ok(l.map(x => ({ id: x.id, nome: x.name, email: x.email, papel: papelDe(x.role), ativo: !x.banned, trocarSenha: x.trocarSenha })));
}

export async function obterUsuario(db: Db, u: Usuario, id: string): Promise<Resultado<LinhaUsuario>> {
  const r = await alvo(db, u, id);
  if (!r.ok) return r;
  const x = r.valor;
  return ok({ id: x.id, nome: x.name, email: x.email, papel: papelDe(x.role), ativo: !x.banned, trocarSenha: x.trocarSenha });
}

export async function criarUsuario(db: Db, auth: Auth, u: Usuario, dados: unknown): Promise<Resultado<{ id: string }>> {
  if (!pode(u, 'usuarios.gerir')) return falha('sem-permissao');
  const v = validar(esquemaUsuario, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  const [existe] = await db.select({ id: user.id }).from(user).where(sql`lower(${user.email}) = ${v.valor.email}`);
  if (existe) return falha('invalida', { erros: { email: 'Já existe uma conta com este e-mail.' } });
  const r = await auth.api.createUser({ body: { name: v.valor.nome, email: v.valor.email, password: v.valor.senha, role: v.valor.papel as 'admin' } });
  return ok({ id: r.user.id });
}

export async function mudarPapel(db: Db, u: Usuario, id: string, papel: string): Promise<Resultado<null>> {
  const r = await alvo(db, u, id);
  if (!r.ok) return r;
  if (papel !== 'admin' && papel !== 'revisor' && papel !== 'editor') return falha('invalida', { erros: { papel: 'Escolha um papel' } });
  if (r.valor.role === 'admin' && papel !== 'admin' && !(await outrosAdminsAtivos(db, id))) return falha('invalida', { erros: { papel: SEM_ADMIN } });
  await db.update(user).set({ role: papel, updatedAt: new Date() }).where(eq(user.id, id));
  return ok(null);
}

export async function desativarUsuario(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const r = await alvo(db, u, id);
  if (!r.ok) return r;
  if (r.valor.role === 'admin' && !(await outrosAdminsAtivos(db, id))) return falha('invalida', { erros: { ativo: SEM_ADMIN } });
  await db.transaction(async tx => {
    await tx.update(user).set({ banned: true, updatedAt: new Date() }).where(eq(user.id, id));
    await tx.delete(session).where(eq(session.userId, id));
  });
  return ok(null);
}

export async function reativarUsuario(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const r = await alvo(db, u, id);
  if (!r.ok) return r;
  await db.update(user).set({ banned: false, banReason: null, banExpires: null, updatedAt: new Date() }).where(eq(user.id, id));
  return ok(null);
}

export async function redefinirSenha(db: Db, auth: Auth, u: Usuario, id: string, senha: string): Promise<Resultado<null>> {
  const r = await alvo(db, u, id);
  if (!r.ok) return r;
  const v = validar(esquemaSenha, senha);
  if (!v.ok) return falha('invalida', { erros: { senha: v.erros._ } });
  const ctx = await auth.$context;
  await ctx.internalAdapter.updatePassword(id, await ctx.password.hash(senha));
  await db.transaction(async tx => {
    await tx.update(user).set({ trocarSenha: true, updatedAt: new Date() }).where(eq(user.id, id));
    await tx.delete(session).where(eq(session.userId, id));
  });
  return ok(null);
}
