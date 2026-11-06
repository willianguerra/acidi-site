// Contadores do Início: cada chave só existe quando o papel pode ver aquilo.
import { count, eq, gte } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { eventos, noticias } from '../db/schema.ts';
import { hojeIso } from '../datas.ts';
import { pode, type Usuario } from './permissoes.ts';
import { naoLidas } from './contatos.ts';

export type Resumo = { publicadas?: number; emRevisao?: number; eventosFuturos: number; mensagensNovas?: number };

export async function resumoPainel(db: Db, u: Usuario): Promise<Resumo> {
  const conta = async (situacao: 'publicada' | 'revisao') => (await db.select({ n: count() }).from(noticias).where(eq(noticias.situacao, situacao)))[0].n;
  const [{ n: eventosFuturos }] = await db.select({ n: count() }).from(eventos).where(gte(eventos.data, hojeIso()));
  const r: Resumo = { eventosFuturos };
  if (pode(u, 'noticia.criar')) r.publicadas = await conta('publicada');
  if (pode(u, 'noticia.publicar', { autorId: null, situacao: 'revisao' })) r.emRevisao = await conta('revisao');
  if (pode(u, 'contatos.ver')) r.mensagensNovas = await naoLidas(db, u);
  return r;
}
