// Regras da agenda no admin: editor, revisor e admin publicam direto (sem revisão).
import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { eventos, user } from '../db/schema.ts';
import { pode, type Usuario } from './permissoes.ts';
import { esquemaEvento, validar } from './validacao.ts';
import { ok, falha, mudouDesde, type Resultado } from './resultado.ts';

export type LinhaEvento = typeof eventos.$inferSelect;

const idValido = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function listarEventos(db: Db, u: Usuario): Promise<Resultado<LinhaEvento[]>> {
  if (!pode(u, 'agenda.editar')) return falha('sem-permissao');
  return ok(await db.select().from(eventos).orderBy(asc(eventos.data)));
}

export async function obterEvento(db: Db, u: Usuario, id: string): Promise<Resultado<LinhaEvento>> {
  if (!pode(u, 'agenda.editar')) return falha('sem-permissao');
  const [e] = idValido(id) ? await db.select().from(eventos).where(eq(eventos.id, id)) : [];
  return e ? ok(e) : falha('nao-encontrada');
}

export async function criarEvento(db: Db, u: Usuario, dados: unknown): Promise<Resultado<{ id: string }>> {
  if (!pode(u, 'agenda.editar')) return falha('sem-permissao');
  const v = validar(esquemaEvento, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  const id = randomUUID();
  await db.insert(eventos).values({ ...v.valor, id, atualizadoPorId: u.id });
  return ok({ id });
}

export async function salvarEvento(db: Db, u: Usuario, id: string, dados: unknown, lidoEm: string): Promise<Resultado<null>> {
  const atual = await obterEvento(db, u, id);
  if (!atual.ok) return atual;
  if (mudouDesde(atual.valor.atualizadoEm, lidoEm)) {
    const [quem] = atual.valor.atualizadoPorId ? await db.select({ nome: user.name }).from(user).where(eq(user.id, atual.valor.atualizadoPorId)) : [];
    return falha('conflito', { quem: quem?.nome ?? 'outra pessoa' });
  }
  const v = validar(esquemaEvento, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  await db.update(eventos).set({ ...v.valor, atualizadoEm: new Date(), atualizadoPorId: u.id }).where(eq(eventos.id, id));
  return ok(null);
}

export async function apagarEvento(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const atual = await obterEvento(db, u, id);
  if (!atual.ok) return atual;
  await db.delete(eventos).where(eq(eventos.id, id));
  return ok(null);
}
