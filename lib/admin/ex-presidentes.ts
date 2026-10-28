// Regras dos ex-presidentes no admin (só admin).
import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { exPresidentes } from '../db/schema.ts';
import { pode, type Usuario } from './permissoes.ts';
import { esquemaExPresidente, validar } from './validacao.ts';
import { trocaComVizinho } from './ordem.ts';
import { ok, falha, type Resultado } from './resultado.ts';

export type ExPresidenteLinha = typeof exPresidentes.$inferSelect;

const idValido = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function listarExPresidentes(db: Db, u: Usuario): Promise<Resultado<ExPresidenteLinha[]>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  return ok(await db.select().from(exPresidentes).orderBy(asc(exPresidentes.ordem)));
}

export async function obterExPresidente(db: Db, u: Usuario, id: string): Promise<Resultado<ExPresidenteLinha>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  const [p] = idValido(id) ? await db.select().from(exPresidentes).where(eq(exPresidentes.id, id)) : [];
  return p ? ok(p) : falha('nao-encontrada');
}

export async function salvarExPresidente(db: Db, u: Usuario, id: string | null, dados: unknown): Promise<Resultado<null>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  const v = validar(esquemaExPresidente, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  if (!id) {
    const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${exPresidentes.ordem}), -1)::int` }).from(exPresidentes);
    await db.insert(exPresidentes).values({ ...v.valor, ordem: m + 1 });
    return ok(null);
  }
  const atual = await obterExPresidente(db, u, id);
  if (!atual.ok) return atual;
  await db.update(exPresidentes).set(v.valor).where(eq(exPresidentes.id, id));
  return ok(null);
}

export async function apagarExPresidente(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const atual = await obterExPresidente(db, u, id);
  if (!atual.ok) return atual;
  await db.delete(exPresidentes).where(eq(exPresidentes.id, id));
  return ok(null);
}

export async function moverExPresidente(db: Db, u: Usuario, id: string, direcao: 'cima' | 'baixo'): Promise<Resultado<null>> {
  const lista = await listarExPresidentes(db, u);
  if (!lista.ok) return lista;
  await db.transaction(async tx => {
    for (const t of trocaComVizinho(lista.valor, id, direcao)) await tx.update(exPresidentes).set({ ordem: t.ordem }).where(eq(exPresidentes.id, t.id));
  });
  return ok(null);
}
