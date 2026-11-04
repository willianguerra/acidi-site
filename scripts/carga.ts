// Copia o conteúdo inicial (scripts/dados) para o banco. Só insere o que falta: rodar de novo não duplica
// nem apaga o que foi criado pelo admin.  Uso: npm run db:carga
import { and, eq, sql } from 'drizzle-orm';
import type { Db } from '../lib/db/index.ts';
import { noticias, eventos, diretoria, exPresidentes } from '../lib/db/schema.ts';
import { NOTICIAS } from './dados/noticias.ts';
import { EVENTOS } from './dados/eventos.ts';
import { DIRETORIA } from './dados/diretoria.ts';
import { EX_PRESIDENTES } from './dados/ex-presidentes.ts';

const IMG = '/assets/img/';

export async function carregar(db: Db): Promise<void> {
  await db.transaction(async tx => {
    await tx.insert(noticias).ignore()  // INSERT IGNORE: slug que já existe fica como está
      // NOTICIAS vem da mais recente para a mais antiga: um segundo a menos por posição desempata notícias do mesmo dia.
      .values(NOTICIAS.map((n, i) => ({ ...n, imagem: IMG + n.imagem, situacao: 'publicada' as const, publicadaEm: new Date(Date.parse(n.data + 'T12:00:00-03:00') - i * 1000) })));

    for (const e of EVENTOS) {
      const [existe] = await tx.select({ id: eventos.id }).from(eventos).where(and(eq(eventos.data, e.data), eq(eventos.titulo, e.titulo)));
      if (!existe) await tx.insert(eventos).values(e);
    }

    const [{ n: membros }] = await tx.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(diretoria);
    if (!membros) {
      const D = DIRETORIA;
      const linhas = [
        ...D.executiva.map(m => ({ grupo: 'executiva' as const, rotulo: m.cargo, nome: m.nome })),
        ...D.vps.map(m => ({ grupo: 'vps' as const, rotulo: m.area, nome: m.nome })),
        ...D.consultivo.map(nome => ({ grupo: 'consultivo' as const, nome })),
        ...D.fiscal.map(m => ({ grupo: 'fiscal' as const, nome: m.nome, suplente: m.suplente })),
        ...D.deliberativo.map(nome => ({ grupo: 'deliberativo' as const, nome })),
        ...D.deliberativoSuplentes.map(nome => ({ grupo: 'deliberativoSuplentes' as const, nome })),
      ];
      await tx.insert(diretoria).values(linhas.map((l, ordem) => ({ ...l, ordem })));
    }

    const [{ n: presidentes }] = await tx.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(exPresidentes);
    if (!presidentes)
      await tx.insert(exPresidentes).values(EX_PRESIDENTES.map((p, ordem) => ({ ...p, foto: p.foto && IMG + p.foto, ordem })));
  });
}

if (import.meta.main) {
  const { db } = await import('../lib/db/index.ts');
  await carregar(db);
  console.log('Carga concluída.');
  await db.$client.end();
}
