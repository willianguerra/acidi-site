import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { dbDeTeste, limpar, fechar, type Db } from './db/teste.ts';
import { noticias } from './db/schema.ts';
import { carregar } from '../scripts/carga.ts';
import { DIRETORIA } from '../scripts/dados/diretoria.ts';
import { EX_PRESIDENTES } from '../scripts/dados/ex-presidentes.ts';
import { NOTICIAS } from '../scripts/dados/noticias.ts';
import * as c from './content.ts';
import { db as dbDoSite } from './db/index.ts';

let db: Db;
before(async () => { db = await dbDeTeste(); });
beforeEach(async () => { await limpar(db); await carregar(db); });
after(async () => { await fechar(db); await fechar(dbDoSite); });

test('contagens do conteúdo carregado (as mesmas da Fase 1)', async () => {
  assert.equal((await c.getEventos()).length, 6);
  assert.equal((await c.getNoticias()).length, 10);
  assert.equal((await c.getDiretoria()).vps.length, 15);
  assert.equal((await c.getExPresidentes()).length, 13);
});

test('carregar de novo não duplica nada', async () => {
  await carregar(db);
  assert.equal((await c.getEventos()).length, 6);
  assert.equal((await c.getNoticias()).length, 10);
  assert.equal((await c.getExPresidentes()).length, 13);
  assert.equal((await c.getDiretoria()).vps.length, 15);
});

test('o site recebe exatamente o conteúdo de antes, com caminhos completos de imagem', async () => {
  assert.deepEqual(await c.getDiretoria(), DIRETORIA);
  assert.deepEqual((await c.getExPresidentes()).map(p => p.nome), EX_PRESIDENTES.map(p => p.nome));
  assert.equal((await c.getExPresidentes())[0].foto, '/assets/img/' + EX_PRESIDENTES[0].foto);
  assert.deepEqual((await c.getNoticias()).map(n => n.slug), NOTICIAS.map(n => n.slug));
  assert.equal((await c.getNoticia('networkaffee'))?.imagem, '/assets/img/networkaffee-2024.jpg');
});

test('notícia que não está publicada não chega ao site', async () => {
  await db.update(noticias).set({ situacao: 'rascunho' }).where(eq(noticias.slug, 'networkaffee'));
  assert.equal((await c.getNoticias()).length, 9);
  assert.equal(await c.getNoticia('networkaffee'), undefined);
  assert.equal(await c.getNoticia('nao-existe'), undefined);
});
