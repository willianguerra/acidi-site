import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { dbDeTeste, limpar, fechar, type Db } from './db/teste.ts';
import { noticias, paginas } from './db/schema.ts';
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

test('páginas fixas: carga completa, edição no banco sobrevive a nova carga', async () => {
  const h = await c.getPaginaFixa('historico');
  assert.equal(h.conteudo.cabecalho.destaque, 'para Indaial');
  assert.equal(h.slug, 'historico');
  assert.equal((await c.getHome()).destaque.linha1, 'Juntos por uma');
  await db.update(paginas).set({ conteudo: { ...h.conteudo, cabecalho: { ...h.conteudo.cabecalho, destaque: 'editado' } } }).where(eq(paginas.fixa, 'historico'));
  await carregar(db);
  assert.equal((await c.getPaginaFixa('historico')).conteudo.cabecalho.destaque, 'editado');
});

test('só páginas publicadas e não fixas chegam ao site; o menu vem por ordem', async () => {
  const base = { situacao: 'rascunho' as const, descricao: 'd', conteudo: { cabecalho: { etiqueta: 'e', titulo: 't', destaque: 'd', chamada: 'c', foto: null }, lateral: null, corpo: [] } };
  await db.insert(paginas).values([
    { ...base, slug: 'rascunho-a', nome: 'A', menu: 'acidi' },
    { ...base, slug: 'publicada-b', nome: 'B', menu: 'negocio', menuTexto: 'Texto B', ordem: 2, situacao: 'publicada' },
    { ...base, slug: 'publicada-c', nome: 'C', menu: 'negocio', ordem: 1, situacao: 'publicada' },
    { ...base, slug: 'sem-menu', nome: 'D', menu: null, situacao: 'publicada' },
  ]);
  assert.equal(await c.getPaginaPublicada('rascunho-a'), undefined);
  assert.equal(await c.getPaginaPublicada('historico'), undefined); // fixa não é página nova
  assert.equal((await c.getPaginaPublicada('publicada-b'))?.nome, 'B');
  assert.deepEqual(await c.getPaginasMenu(), [
    { menu: 'negocio', slug: 'publicada-c', nome: 'C', menuTexto: null },
    { menu: 'negocio', slug: 'publicada-b', nome: 'B', menuTexto: 'Texto B' },
  ]);
});

test('página fixa sem linha no banco: erro manda rodar a carga', async () => {
  await db.delete(paginas).where(eq(paginas.fixa, 'nucleos'));
  await assert.rejects(c.getPaginaFixa('nucleos'), /npm run db:carga/);
});
