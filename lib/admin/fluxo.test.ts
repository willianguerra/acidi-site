import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proxima } from './fluxo.ts';

test('transições válidas', () => {
  assert.equal(proxima('rascunho', 'enviar'), 'revisao');
  assert.equal(proxima('devolvida', 'enviar'), 'revisao');
  assert.equal(proxima('revisao', 'publicar'), 'publicada');
  assert.equal(proxima('rascunho', 'publicar'), 'publicada');
  assert.equal(proxima('devolvida', 'publicar'), 'publicada');
  assert.equal(proxima('revisao', 'devolver'), 'devolvida');
  assert.equal(proxima('publicada', 'despublicar'), 'rascunho');
});

test('transições inválidas devolvem null', () => {
  assert.equal(proxima('publicada', 'enviar'), null);
  assert.equal(proxima('revisao', 'enviar'), null);
  assert.equal(proxima('rascunho', 'devolver'), null);
  assert.equal(proxima('publicada', 'publicar'), null);
  assert.equal(proxima('rascunho', 'despublicar'), null);
});
