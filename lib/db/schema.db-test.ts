import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { dbDeTeste, limpar, fechar, type Db } from './teste.ts';
import { noticias } from './schema.ts';

let db: Db;
before(async () => { db = await dbDeTeste(); });
beforeEach(() => limpar(db));
after(() => fechar(db));

test('insere e lê uma notícia com corpo em blocos', async () => {
  await db.insert(noticias).values({ slug: 'x', data: '2026-11-05', titulo: 'X', imagem: '/a.jpg', alt: 'a', resumo: 'r', corpo: ['p', { lista: ['a'] }] });
  const [n] = await db.select().from(noticias).where(eq(noticias.slug, 'x'));
  assert.deepEqual(n.corpo, ['p', { lista: ['a'] }]);
  assert.equal(n.data, '2026-11-05');
  assert.equal(n.situacao, 'rascunho');
});
