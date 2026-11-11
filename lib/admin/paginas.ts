// Regras das páginas editáveis no admin (só admin). Cada função confere pode() antes de agir;
// as Server Actions só chamam estas funções e revalidam o site.
import { randomUUID } from 'node:crypto';
import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { paginas, user } from '../db/schema.ts';
import type { Fixa } from '../types.ts';
import { pode, type Usuario } from './permissoes.ts';
import { esquemaHome, esquemaPagina, validar } from './validacao.ts';
import { trocaComVizinho } from './ordem.ts';
import { ok, falha, mudouDesde, type Resultado } from './resultado.ts';

export type LinhaPagina = typeof paginas.$inferSelect;

// Partes editáveis de cada página fixa (conferido em app/(site)/<fixa>/page.tsx); false = a página não tem a parte.
export const CAMPOS_FIXA: Record<Exclude<Fixa, 'home'>, { foto: boolean; lateral: boolean; corpo: boolean }> = {
  historico: { foto: true, lateral: false, corpo: true }, // lateral é um localnav fixo
  nucleos: { foto: false, lateral: true, corpo: true },
  representatividade: { foto: true, lateral: true, corpo: true },
  'para-seu-negocio': { foto: false, lateral: false, corpo: false }, // lateral é um localnav; o resto é a lista de serviços
  auditorio: { foto: false, lateral: false, corpo: false },
  'associe-se': { foto: true, lateral: false, corpo: false },
  contato: { foto: false, lateral: false, corpo: false },
  noticias: { foto: false, lateral: false, corpo: false },
  agenda: { foto: false, lateral: false, corpo: false },
  diretoria: { foto: false, lateral: true, corpo: false }, // o cabeçalho tem texto livre ao lado (posse da diretoria)
  'ex-presidentes': { foto: false, lateral: false, corpo: false },
};

const idValido = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
const doMenu = (menu: LinhaPagina['menu']) => (menu ? eq(paginas.menu, menu) : isNull(paginas.menu));
const proximaOrdem = async (db: Db, menu: LinhaPagina['menu']) =>
  (await db.select({ m: sql<number>`coalesce(max(${paginas.ordem}), -1)`.mapWith(Number) }).from(paginas).where(doMenu(menu)))[0].m + 1;

export async function listarPaginas(db: Db, u: Usuario): Promise<Resultado<LinhaPagina[]>> {
  if (!pode(u, 'paginas.editar')) return falha('sem-permissao');
  const grupo = sql`case when ${paginas.fixa} = 'home' then 0 when ${paginas.fixa} is not null then 1 else 2 end`;
  return ok(await db.select().from(paginas).orderBy(grupo, asc(paginas.menu), asc(paginas.ordem)));
}

export async function obterPagina(db: Db, u: Usuario, id: string): Promise<Resultado<LinhaPagina>> {
  if (!pode(u, 'paginas.editar')) return falha('sem-permissao');
  const [p] = idValido(id) ? await db.select().from(paginas).where(eq(paginas.id, id)) : [];
  return p ? ok(p) : falha('nao-encontrada');
}

export async function obterPaginaFixa(db: Db, u: Usuario, fixa: Fixa): Promise<Resultado<LinhaPagina>> {
  if (!pode(u, 'paginas.editar')) return falha('sem-permissao');
  const [p] = await db.select().from(paginas).where(eq(paginas.fixa, fixa));
  return p ? ok(p) : falha('nao-encontrada');
}

export async function salvarPagina(db: Db, u: Usuario, id: string | null, dados: unknown, lidaEm?: string, { publicar = false } = {}): Promise<Resultado<{ id: string; slug: string; publicada: boolean }>> {
  if (!pode(u, 'paginas.editar')) return falha('sem-permissao');
  const atual = id ? await obterPagina(db, u, id) : null;
  if (atual && !atual.ok) return atual;
  const p = atual?.valor;
  if (p?.fixa && publicar) return falha('invalida', { erros: { situacao: 'Páginas fixas ficam sempre no ar.' } });
  if (p && lidaEm !== undefined && mudouDesde(p.atualizadaEm, lidaEm)) {
    const [quem] = p.atualizadaPorId ? await db.select({ nome: user.name }).from(user).where(eq(user.id, p.atualizadaPorId)) : [];
    return falha('conflito', { quem: quem?.nome ?? 'outra pessoa' });
  }
  const auditoria = { atualizadaEm: new Date(), atualizadaPorId: u.id };

  if (p?.fixa === 'home') {
    const v = validar(esquemaHome, dados);
    if (!v.ok) return falha('invalida', { erros: v.erros });
    await db.update(paginas).set({ conteudo: v.valor, ...auditoria }).where(eq(paginas.id, p.id));
    return ok({ id: p.id, slug: p.slug, publicada: true });
  }

  // Só o formulário de criação define o endereço.
  const v = validar(esquemaPagina, p && dados && typeof dados === 'object' ? { ...dados, slug: undefined } : dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  const { nome, descricao, conteudo } = v.valor;
  if (p?.fixa) { // fixa: endereço, menu e situação não mudam
    await db.update(paginas).set({ nome, descricao, conteudo, ...auditoria }).where(eq(paginas.id, p.id));
    return ok({ id: p.id, slug: p.slug, publicada: true });
  }

  const { menu, menuTexto } = v.valor;
  if (p) {
    // mudou de menu: vai para o fim do novo grupo
    const ordem = p.menu === menu ? p.ordem : await proximaOrdem(db, menu);
    await db.update(paginas).set({
      nome, descricao, menu, menuTexto, ordem, conteudo, situacao: publicar ? 'publicada' : undefined, ...auditoria,
    }).where(eq(paginas.id, p.id));
    return ok({ id: p.id, slug: p.slug, publicada: publicar || p.situacao === 'publicada' });
  }
  const slug = v.valor.slug;
  if (!slug) return falha('invalida', { erros: { slug: 'Campo obrigatório' } });
  const [repetida] = await db.select({ id: paginas.id }).from(paginas).where(eq(paginas.slug, slug));
  if (repetida) return falha('invalida', { erros: { slug: 'Já existe uma página com este endereço.' } });
  const novoId = randomUUID();
  await db.insert(paginas).values({ id: novoId, nome, slug, descricao, menu, menuTexto, conteudo, situacao: publicar ? 'publicada' : 'rascunho', ordem: await proximaOrdem(db, menu), ...auditoria });
  return ok({ id: novoId, slug, publicada: publicar });
}

async function mudarSituacao(db: Db, u: Usuario, id: string, situacao: LinhaPagina['situacao']): Promise<Resultado<null>> {
  const p = await obterPagina(db, u, id);
  if (!p.ok) return p;
  if (p.valor.fixa) return falha('invalida', { erros: { situacao: 'Páginas fixas ficam sempre no ar.' } });
  await db.update(paginas).set({ situacao, atualizadaEm: new Date(), atualizadaPorId: u.id }).where(eq(paginas.id, id));
  return ok(null);
}

export const publicarPagina = (db: Db, u: Usuario, id: string) => mudarSituacao(db, u, id, 'publicada');
export const tirarDoAr = (db: Db, u: Usuario, id: string) => mudarSituacao(db, u, id, 'rascunho');

export async function apagarPagina(db: Db, u: Usuario, id: string): Promise<Resultado<null>> {
  const p = await obterPagina(db, u, id);
  if (!p.ok) return p;
  if (p.valor.fixa) return falha('invalida', { erros: { fixa: 'Páginas fixas não podem ser apagadas.' } });
  await db.delete(paginas).where(eq(paginas.id, id));
  return ok(null);
}

export async function moverPagina(db: Db, u: Usuario, id: string, direcao: 'cima' | 'baixo'): Promise<Resultado<null>> {
  const p = await obterPagina(db, u, id);
  if (!p.ok) return p;
  if (p.valor.fixa) return falha('invalida', { erros: { fixa: 'Páginas fixas não mudam de lugar.' } });
  const grupo = await db.select().from(paginas).where(and(doMenu(p.valor.menu), isNull(paginas.fixa))).orderBy(asc(paginas.ordem));
  await db.transaction(async tx => {
    for (const t of trocaComVizinho(grupo, id, direcao)) await tx.update(paginas).set({ ordem: t.ordem }).where(eq(paginas.id, t.id));
  });
  return ok(null);
}
