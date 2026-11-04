import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotaDe, ROTAS, ROTAS_WP } from './rotas.ts';

test('index', () => assert.equal(rotaDe('index.html'), '/'));
test('página simples', () => assert.equal(rotaDe('associe-se.html'), '/associe-se'));
test('notícia', () => assert.equal(rotaDe('noticia-networkaffee.html'), '/noticias/networkaffee'));
test('desconhecido', () => assert.equal(rotaDe('nada.html'), undefined));

test('URLs do WordPress apontam para rotas que existem no site novo', () => {
  const paginas = new Set(Object.values(ROTAS));
  for (const [wp, destino] of Object.entries(ROTAS_WP)) {
    const base = destino.split('#')[0];
    assert.ok(paginas.has(base) || /^\/noticias\/[a-z0-9-]+$/.test(base), `${wp} -> ${destino}`);
  }
});
