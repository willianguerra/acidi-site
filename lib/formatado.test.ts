import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkSeguro, partes } from './formatado.ts';

test('negrito', () => assert.deepEqual(partes('a **b** c'), ['a ', { b: 'b' }, ' c']));
test('link', () => assert.deepEqual(partes('ver [notícia](/noticias/x).'), ['ver ', { a: 'notícia', href: '/noticias/x' }, '.']));
test('asterisco solto e par aberto ficam texto', () => assert.deepEqual(partes('2 * 3 e **aberto'), ['2 * 3 e **aberto']));
test('link inseguro vira texto', () => assert.deepEqual(partes('[x](javascript:alert(1))'), ['[x](javascript:alert(1))']));
test('html não vira nada', () => assert.deepEqual(partes('<b>oi</b>'), ['<b>oi</b>']));
test('linkSeguro aceita', () => {
  for (const h of ['/a', '#b', 'https://x', 'http://x', 'mailto:a@b', 'tel:+55']) assert.equal(linkSeguro(h), true, h);
});
test('linkSeguro recusa', () => {
  for (const h of ['javascript:x', 'data:x', '//x', 'ftp://x', '']) assert.equal(linkSeguro(h), false, h);
});
