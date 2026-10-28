// Regras da diretoria no admin (só admin). A ordem é global; cada grupo é exibido na ordem relativa.
import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { diretoria } from '../db/schema.ts';
import { pode, type Usuario } from './permissoes.ts';
import { esquemaMembro, validar } from './validacao.ts';
import { trocaComVizinho } from './ordem.ts';
import { ok, falha, type Resultado } from './resultado.ts';

export type Membro = typeof diretoria.$inferSelect;
export const GRUPOS: Record<Membro['grupo'], string> = {
  executiva: 'Diretoria executiva', vps: 'Vice-presidências', consultivo: 'Conselho consultivo',
  fiscal: 'Conselho fiscal', deliberativo: 'Conselho deliberativo', deliberativoSuplentes: 'Conselho deliberativo: suplentes',
};

const idValido = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
const proximaOrdem = async (db: Db) => (await db.select({ m: sql<number>`coalesce(max(${diretoria.ordem}), -1)::int` }).from(diretoria))[0].m + 1;

export async function listarMembros(db: Db, u: Usuario): Promise<Resultado<Membro[]>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  return ok(await db.select().from(diretoria).orderBy(asc(diretoria.ordem)));
}

export async function obterMembro(db: Db, u: Usuario, id: string): Promise<Resultado<Membro>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  const [m] = idValido(id) ? await db.select().from(diretoria).where(eq(diretoria.id, id)) : [];
  return m ? ok(m) : falha('nao-encontrada');
}

export async function salvarMembro(db: Db, u: Usuario, id: string | null, dados: unknown): Promise<Resultado<null>> {
  if (!pode(u, 'diretoria.editar')) return falha('sem-permissao');
  const v = validar(esquemaMembro, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  if (!id) {
    await db.insert(diretoria).values({ ...v.valor, ordem: await proximaOrdem(db) });
    return ok(null);
  }
  const atual = await obterMembro(db, u, id);
  if (!atual.ok) return atual;
  // mudou de grupo: vai para o fim do novo grupo
  const ordem = atual.valor.grupo === v.valor.grupo ? atual.valor.ordem : await proximaOrdem(db);
  await db.update(diretoria).set({ ...v.valor, ordem }).where(eq(diretoria.id, id));
  return ok(null);
}

export async function apagarMembro(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const atual = await obterMembro(db, u, id);
  if (!atual.ok) return atual;
  await db.delete(diretoria).where(eq(diretoria.id, id));
  return ok(null);
}

export async function moverMembro(db: Db, u: Usuario, id: string, direcao: 'cima' | 'baixo'): Promise<Resultado<null>> {
  const atual = await obterMembro(db, u, id);
  if (!atual.ok) return atual;
  const grupo = await db.select().from(diretoria).where(eq(diretoria.grupo, atual.valor.grupo)).orderBy(asc(diretoria.ordem));
  await db.transaction(async tx => {
    for (const t of trocaComVizinho(grupo, id, direcao)) await tx.update(diretoria).set({ ordem: t.ordem }).where(eq(diretoria.id, t.id));
  });
  return ok(null);
}
