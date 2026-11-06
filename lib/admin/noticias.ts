// Regras das notícias no admin. Cada função confere pode() antes de agir; as Server Actions só
// obtêm o usuário da sessão, chamam estas funções e revalidam as páginas públicas.
import { randomUUID } from 'node:crypto';
import { and, asc, count, desc, eq, isNotNull, like, ne, or, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { noticias, user } from '../db/schema.ts';
import { pode, type Acao, type Usuario } from './permissoes.ts';
import { proxima, SITUACOES, type Evento, type Situacao } from './fluxo.ts';
import { POR_PAGINA, limitarPagina } from './lista.ts';
import { slugDe } from './slug.ts';
import { esquemaNoticia, validar } from './validacao.ts';
import { ok, falha, mudouDesde, type Resultado } from './resultado.ts';

export type LinhaNoticia = typeof noticias.$inferSelect;
export type ItemLista = Pick<LinhaNoticia, 'id' | 'slug' | 'titulo' | 'data' | 'situacao' | 'autorId' | 'atualizadaEm' | 'comentarioRevisao' | 'imagem'> & { autor: string | null };

const daAcao = (u: Usuario, acao: Acao, n?: LinhaNoticia) => pode(u, acao, n && { autorId: n.autorId, situacao: n.situacao });

async function carregar(db: Db, id: string): Promise<LinhaNoticia | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [n] = await db.select().from(noticias).where(eq(noticias.id, id));
  return n;
}

// Primeiro slug livre: base, base-2, base-3...
async function slugLivre(db: Db, base: string, ignorarId?: string): Promise<string> {
  const usados = new Set((await db.select({ slug: noticias.slug }).from(noticias)
    .where(and(or(eq(noticias.slug, base), like(noticias.slug, base + '-%')), ignorarId ? ne(noticias.id, ignorarId) : undefined))).map(r => r.slug));
  let s = base;
  for (let i = 2; usados.has(s); i++) s = `${base}-${i}`;
  return s;
}

export type FiltroNoticias = { situacao?: Situacao; busca?: string; autorId?: string; ano?: number; pagina?: number };

// O editor vê as próprias e as publicadas; vale para a lista, as contagens e as opções dos filtros.
const visiveis = (u: Usuario) => (u.papel === 'editor' ? or(eq(noticias.autorId, u.id), eq(noticias.situacao, 'publicada')) : undefined);

export async function listarNoticias(db: Db, u: Usuario, filtro: FiltroNoticias) {
  if (!pode(u, 'noticia.criar')) return falha('sem-permissao');
  const base: (SQL | undefined)[] = [visiveis(u)];
  if (filtro.busca?.trim()) base.push(like(noticias.titulo, `%${filtro.busca.trim().replace(/[%_\\]/g, '\\$&')}%`));
  if (filtro.autorId) base.push(eq(noticias.autorId, filtro.autorId));
  if (filtro.ano) base.push(sql`year(${noticias.data}) = ${filtro.ano}`);
  const onde = and(...base, filtro.situacao ? eq(noticias.situacao, filtro.situacao) : undefined);
  const [{ total }] = await db.select({ total: count() }).from(noticias).where(onde);
  const pagina = limitarPagina(filtro.pagina ?? 1, total);
  const itens: ItemLista[] = await db.select({
    id: noticias.id, slug: noticias.slug, titulo: noticias.titulo, data: noticias.data, situacao: noticias.situacao, imagem: noticias.imagem,
    autorId: noticias.autorId, atualizadaEm: noticias.atualizadaEm, comentarioRevisao: noticias.comentarioRevisao, autor: user.name,
  }).from(noticias).leftJoin(user, eq(user.id, noticias.autorId)).where(onde)
    .orderBy(desc(noticias.atualizadaEm)).limit(POR_PAGINA).offset((pagina - 1) * POR_PAGINA);
  const porSituacao = Object.fromEntries(Object.keys(SITUACOES).map(k => [k, 0])) as Record<Situacao, number>;
  for (const g of await db.select({ situacao: noticias.situacao, n: count() }).from(noticias).where(and(...base)).groupBy(noticias.situacao)) porSituacao[g.situacao] = g.n;
  return ok({ itens, total, pagina, porSituacao });
}

export async function autoresDeNoticias(db: Db, u: Usuario): Promise<{ id: string; nome: string }[]> {
  return db.selectDistinct({ id: user.id, nome: user.name }).from(noticias).innerJoin(user, eq(user.id, noticias.autorId))
    .where(and(visiveis(u), isNotNull(noticias.autorId))).orderBy(asc(user.name));
}

export async function anosDeNoticias(db: Db, u: Usuario): Promise<number[]> {
  const ano = sql<number>`year(${noticias.data})`;
  return (await db.selectDistinct({ ano }).from(noticias).where(visiveis(u)).orderBy(desc(ano))).map(r => Number(r.ano));
}

export async function obterNoticia(db: Db, u: Usuario, id: string): Promise<Resultado<LinhaNoticia>> {
  const n = await carregar(db, id);
  if (!n) return falha('nao-encontrada');
  if (!pode(u, 'noticia.criar') || (u.papel === 'editor' && n.autorId !== u.id && n.situacao !== 'publicada')) return falha('sem-permissao');
  return ok(n);
}

export async function criarNoticia(db: Db, u: Usuario, dados: unknown): Promise<Resultado<{ id: string; slug: string }>> {
  if (!pode(u, 'noticia.criar')) return falha('sem-permissao');
  const v = validar(esquemaNoticia, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  const { slug: pedido, ...campos } = v.valor;
  const slug = await slugLivre(db, slugDe(pedido || campos.titulo) || 'noticia');
  const id = randomUUID();
  await db.insert(noticias).values({ ...campos, id, slug, autorId: u.id, atualizadaPorId: u.id });
  return ok({ id, slug });
}

export async function salvarNoticia(db: Db, u: Usuario, id: string, dados: unknown, lidaEm: string): Promise<Resultado<{ slug: string; publicada: boolean }>> {
  const n = await carregar(db, id);
  if (!n) return falha('nao-encontrada');
  if (!daAcao(u, 'noticia.editar', n)) return falha('sem-permissao');
  if (mudouDesde(n.atualizadaEm, lidaEm)) {
    const [quem] = n.atualizadaPorId ? await db.select({ nome: user.name }).from(user).where(eq(user.id, n.atualizadaPorId)) : [];
    return falha('conflito', { quem: quem?.nome ?? 'outra pessoa' });
  }
  const v = validar(esquemaNoticia, dados);
  if (!v.ok) return falha('invalida', { erros: v.erros });
  const { slug: pedido, ...campos } = v.valor;
  // depois da primeira publicação o endereço fica travado, para não quebrar links
  const slug = n.publicadaEm || !pedido ? n.slug : await slugLivre(db, slugDe(pedido) || n.slug, n.id);
  await db.update(noticias).set({ ...campos, slug, atualizadaEm: new Date(), atualizadaPorId: u.id }).where(eq(noticias.id, id));
  return ok({ slug, publicada: n.situacao === 'publicada' });
}

async function transicionar(db: Db, u: Usuario, id: string, evento: Evento, acao: Acao, extra: Partial<LinhaNoticia> = {}): Promise<Resultado<{ slug: string }>> {
  const n = await carregar(db, id);
  if (!n) return falha('nao-encontrada');
  if (!daAcao(u, acao, n)) return falha('sem-permissao');
  const nova = proxima(n.situacao, evento);
  if (!nova) return falha('invalida', { erros: { situacao: 'Esta ação não vale para a situação atual da notícia.' } });
  await db.update(noticias).set({ situacao: nova, ...extra, atualizadaEm: new Date(), atualizadaPorId: u.id }).where(eq(noticias.id, id));
  return ok({ slug: n.slug });
}

export const enviarNoticia = (db: Db, u: Usuario, id: string) => transicionar(db, u, id, 'enviar', 'noticia.enviar', { comentarioRevisao: null });
export const publicarNoticia = (db: Db, u: Usuario, id: string) =>
  transicionar(db, u, id, 'publicar', 'noticia.publicar', { comentarioRevisao: null, publicadaPorId: u.id, publicadaEm: new Date() });
export const despublicarNoticia = (db: Db, u: Usuario, id: string) => transicionar(db, u, id, 'despublicar', 'noticia.despublicar');

export async function devolverNoticia(db: Db, u: Usuario, id: string, comentario: string): Promise<Resultado<{ slug: string }>> {
  if (!comentario.trim()) return falha('invalida', { erros: { comentario: 'Explique ao autor o que precisa mudar.' } });
  return transicionar(db, u, id, 'devolver', 'noticia.devolver', { comentarioRevisao: comentario.trim() });
}

export async function apagarNoticia(db: Db, u: Usuario, id: string): Promise<Resultado<{ slug: string; publicada: boolean }>> {
  const n = await carregar(db, id);
  if (!n) return falha('nao-encontrada');
  if (!daAcao(u, 'noticia.apagar', n)) return falha('sem-permissao');
  await db.delete(noticias).where(eq(noticias.id, id));
  return ok({ slug: n.slug, publicada: n.situacao === 'publicada' });
}
