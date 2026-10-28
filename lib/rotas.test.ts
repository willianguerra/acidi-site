import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotaDe } from './rotas.ts';

test('index', () => assert.equal(rotaDe('index.html'), '/'));
test('página simples', () => assert.equal(rotaDe('associe-se.html'), '/associe-se'));
test('notícia', () => assert.equal(rotaDe('noticia-networkaffee.html'), '/noticias/networkaffee'));
test('desconhecido', () => assert.equal(rotaDe('nada.html'), undefined));
