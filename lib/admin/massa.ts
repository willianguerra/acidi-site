// Ações em massa: cada item passa pela mesma função (e pelo mesmo pode()) da ação individual.
import type { Db } from '../db/index.ts';
import type { Usuario } from './permissoes.ts';
import type { Resultado } from './resultado.ts';
import { apagarNoticia, despublicarNoticia, publicarNoticia } from './noticias.ts';
import { resumoMassa } from './lista.ts';

export type AcaoNoticiaMassa = 'publicar' | 'despublicar' | 'apagar';
const FAZ = { publicar: publicarNoticia, despublicar: despublicarNoticia, apagar: apagarNoticia };

export async function noticiasEmMassa(db: Db, u: Usuario, acao: AcaoNoticiaMassa, ids: string[]) {
  const rs: Resultado<{ slug: string }>[] = [];
  for (const id of ids) rs.push(await FAZ[acao](db, u, id)); // em sequência: cada uma lê e grava a própria linha
  return { resumo: resumoMassa(rs), slugs: rs.flatMap(r => (r.ok ? [r.valor.slug] : [])) };
}
